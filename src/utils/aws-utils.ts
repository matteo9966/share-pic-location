import {
  CognitoIdentityClient,
  GetIdCommand,
  GetCredentialsForIdentityCommand,
  type CognitoIdentityClientConfig,
  type Credentials,
} from '@aws-sdk/client-cognito-identity';
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Constants
const STORAGE_KEYS = {
  IDENTITY_ID: 'identityId',
};

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
const IDENTITY_POOL_ID = import.meta.env.VITE_COGNITO_IDENTITY_POOL_ID;
const AWS_REGION = import.meta.env.VITE_AWS_REGION;
const COGNITO_USER_POOL_ID = import.meta.env.VITE_COGNITO_USER_POOL_ID;
const S3_BUCKET_NAME = import.meta.env.VITE_AWS_S3_BUCKET_NAME;
const USER_POOL_ARN = `cognito-idp.${AWS_REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}`;

// Types
interface IAMCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
}

interface CachedSession {
  credentials: IAMCredentials;
  exp: number;
}

// Cognito Identity Helper
class CognitoIdentityHelper {
  private cognitoClient: CognitoIdentityClient;
  private config: CognitoIdentityClientConfig;

  constructor() {
    this.config = { region: AWS_REGION };
    this.cognitoClient = new CognitoIdentityClient(this.config);
  }

  async getId(idToken: string): Promise<string> {
    const input = {
      IdentityPoolId: IDENTITY_POOL_ID,
      ...(idToken && {
        Logins: {
          [USER_POOL_ARN]: idToken,
        },
      }),
    };
    const command = new GetIdCommand(input);
    const response = await this.cognitoClient.send(command);
    console.log('GetId response:', response);

    if (response?.IdentityId) {
      localStorage.setItem(STORAGE_KEYS.IDENTITY_ID, response.IdentityId);
    }
    return response?.IdentityId || '';
  }

  async getIAMCredentials(idToken: string): Promise<IAMCredentials> {
    const identityId = await this.getOrFetchIdentityId(idToken);

    // Check cache first
    const cachedSession = this.getCachedSession(identityId);
    if (cachedSession) {
      console.log('Using cached IAM credentials');
      return cachedSession.credentials;
    }

    console.log('Fetching new IAM credentials');
    const input = {
      IdentityId: identityId,
      ...(idToken && {
        Logins: {
          [USER_POOL_ARN]: idToken,
        },
      }),
    };

    const command = new GetCredentialsForIdentityCommand(input);
    const response = await this.cognitoClient.send(command);
    console.log('GetCredentialsForIdentity response:', response);

    if (!response?.Credentials) {
      throw new Error('Failed to get IAM credentials');
    }

    const credentials = this.mapCredentials(response.Credentials);
    this.cacheSession(identityId, credentials, response.Credentials.Expiration);

    return credentials;
  }

  private async getOrFetchIdentityId(idToken: string): Promise<string> {
    const cachedId = localStorage.getItem(STORAGE_KEYS.IDENTITY_ID);
    return cachedId || this.getId(idToken);
  }

  private getCachedSession(identityId: string): CachedSession | null {
    const session = JSON.parse(sessionStorage.getItem(identityId) ?? '{}');
    if (session && session.exp > Date.now()) {
      return session;
    }
    return null;
  }

  private cacheSession(
    identityId: string,
    credentials: IAMCredentials,
    expiration: Date | undefined,
  ): void {
    const exp = new Date(expiration || Date.now()).getTime();
    sessionStorage.setItem(
      identityId,
      JSON.stringify({ credentials, exp }),
    );
  }

  private mapCredentials(
    awsCredentials: Credentials,
  ): IAMCredentials {
    return {
      accessKeyId: awsCredentials.AccessKeyId || '',
      secretAccessKey: awsCredentials.SecretKey || '',
      sessionToken: awsCredentials.SessionToken || '',
    };
  }
}

// S3 File Service
class S3FileService {
  private s3BucketName: string;
  private awsRegion: string;

  constructor(bucketName = S3_BUCKET_NAME, region = AWS_REGION) {
    this.s3BucketName = bucketName;
    this.awsRegion = region;
  }

  private async createS3Client(credentials: IAMCredentials): Promise<S3Client> {
    return new S3Client({
      region: this.awsRegion,
      credentials,
      requestChecksumCalculation:'WHEN_REQUIRED'
    });
  }

  async uploadFile(
    file: File,
    fileName: string,
    credentials: IAMCredentials,
  ): Promise<boolean> {
    const s3Client = await this.createS3Client(credentials);
    const input = {
      Bucket: this.s3BucketName,
      Key: fileName,
      Body: file,
      ContentType: file.type,
    };

    const command = new PutObjectCommand(input);
    const response = await s3Client.send(command);
    console.log('Upload response:', response);

    return response.$metadata.httpStatusCode === 200;
  }


  async downloadFile(
    key: string,
    credentials: IAMCredentials,
  ): Promise<void> {
    console.log('Downloading file:', key);
    const s3Client = await this.createS3Client(credentials);
    const input = {
      Bucket: this.s3BucketName,
      Key: key,
    };

    const command = new GetObjectCommand(input);
    const response = await s3Client.send(command);
    console.log('Download response:', response);

    const stream = response.Body;
    if (!stream) {
      throw new Error('No data received from S3');
    }

    await this.saveBlob(stream, key);
  }

  async listFiles(prefix: string, credentials: IAMCredentials): Promise<string[]> {
    const s3Client = await this.createS3Client(credentials);
    const input = {
      Bucket: this.s3BucketName,
      Prefix: prefix,
    };

    try {
      const command = new ListObjectsV2Command(input);
      const response = await s3Client.send(command);
      console.log('ListObjectsV2 response:', response);

      return this.filterImageFiles(response.Contents || []);
    } catch (err) {
      console.error('Error listing S3 files:', err);
      return [];
    }
  }

  async getPublicFiles(credentials: IAMCredentials): Promise<string[]> {
    return this.listFiles('public/', credentials);
  }

  async getPrivateFiles(identityId: string, credentials: IAMCredentials): Promise<string[]> {
    return this.listFiles(`private/${identityId}/`, credentials);
  }

  async getPresignedUrl(
    key: string,
    credentials: IAMCredentials,
    expiresIn = 600,
  ): Promise<string> {
    const s3Client = await this.createS3Client(credentials);
    const command = new GetObjectCommand({
      Bucket: this.s3BucketName,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  }

  private filterImageFiles(
    contents: Array<{ Key?: string }>,
  ): string[] {
    return contents
      .filter(item => {
        const isFolder = item?.Key?.endsWith('/');
        const hasImageExtension = IMAGE_EXTENSIONS.some(ext =>
          item?.Key?.toLowerCase().endsWith(ext),
        );
        return !isFolder && hasImageExtension;
      })
      .map(item => item.Key || '');
  }

  private async saveBlob(stream: AsyncIterable<Uint8Array>, key: string): Promise<void> {
    const chunks: BlobPart[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk as unknown as BlobPart);
    }
    const blob = new Blob(chunks);

    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = key;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(url);
  }


  // private createKeyForPrivateFolder(fileName: string, userId: string): string {
  //   return `private/${userId}/${fileName}`;
  // }

  // async uploadToPrivateFolder(file: File, idToken: string): Promise<boolean> {
  //   const identityId = localStorage.getItem(STORAGE_KEYS.IDENTITY_ID);
  //   if (!identityId) {
  //     throw new Error('Identity ID not found in local storage');
  //   }
  //   const privateKey = this.createKeyForPrivateFolder(file.name, identityId);
  //   const credentials = await getIAMCreds(idToken);
  //   return this.uploadFile(file, privateKey, credentials);
  // }




}

// Service Instances
const cognitoHelper = new CognitoIdentityHelper();
const s3Service = new S3FileService();

// Public API - Backwards compatible wrapper functions
const getId = async (idToken: string): Promise<string> => {
  return cognitoHelper.getId(idToken);
};

const getIAMCreds = async (idToken: string): Promise<IAMCredentials> => {
  return cognitoHelper.getIAMCredentials(idToken);
};

const getFileFromS3 = async (key: string, idToken: string): Promise<void> => {
  const credentials = await getIAMCreds(idToken);
  return s3Service.downloadFile(key, credentials);
};

const getPublicS3Files = async (idToken: string): Promise<string[]> => {
  const credentials = await getIAMCreds(idToken);
  return s3Service.getPublicFiles(credentials);
};

const getPrivateS3Files = async (idToken: string): Promise<string[]> => {
  const identityId = localStorage.getItem(STORAGE_KEYS.IDENTITY_ID);
  if (!identityId) {
    throw new Error('Identity ID not found in local storage');
  }
  const credentials = await getIAMCreds(idToken);
  return s3Service.getPrivateFiles(identityId, credentials);
};

const putFileToS3 = async (
  file: File,
  fileName: string,
  idToken: string,
): Promise<boolean> => {
  const credentials = await getIAMCreds(idToken);
  return s3Service.uploadFile(file, fileName, credentials);
};

const getPresignedUrl = async (key: string, idToken: string): Promise<string> => {
  const credentials = await getIAMCreds(idToken);
  return s3Service.getPresignedUrl(key, credentials);
};

const getMultiplePresignedUrls = async (
  keys: string[],
  idToken: string,
): Promise<string[]> => {
  const urlPromises = keys.map(key =>
    getPresignedUrl(key, idToken).catch(err => {
      console.error(`Failed to fetch presigned URL for ${key}:`, err);
      return null;
    }),
  );

  const urls = await Promise.all(urlPromises);

  // Filter out any failed requests (null values)
  return urls.filter((url): url is string => url !== null);
};

  export function createKeyForPrivateFolder(fileName: string, userId: string): string {
    return `private/${userId}/${fileName}`;
  }


export async function uploadToPrivateFolder(file: File, idToken: string): Promise<boolean> {
  const identityId = localStorage.getItem(STORAGE_KEYS.IDENTITY_ID);
  if (!identityId) {
    throw new Error('Identity ID not found in local storage');
  }
  const privateKey = createKeyForPrivateFolder(file.name, identityId);
  const credentials = await getIAMCreds(idToken);
  return s3Service.uploadFile(file, privateKey, credentials);
}


export {
  getId,
  getIAMCreds,
  getFileFromS3,
  putFileToS3,
  getPrivateS3Files,
  getPublicS3Files,
  getPresignedUrl,
  getMultiplePresignedUrls,
  CognitoIdentityHelper,
  S3FileService,
  type IAMCredentials,
};
