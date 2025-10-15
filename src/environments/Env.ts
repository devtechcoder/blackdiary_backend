export interface Environment {
  nodeEnv: string;
  dbUrl: string;
  baseUrl: string;
  awsSecretKey: string;
  awsAccessKey: string;
  region: string;
  s3Bucket: string;
  s3Url: string;
}

export function env(): Environment {
  return {
    nodeEnv: process.env.NODE_ENV,
    dbUrl: process.env.DB_URL ?? "mongodb+srv://devtechcoder:unMbEu2XdPAGBEzj@cluster0.ds27tbb.mongodb.net/blackDiary?retryWrites=true&w=majority&appName=Cluster0",
    baseUrl: process.env.BASE_URL ?? "",
    awsSecretKey: process.env.aws_secret_key ?? "",
    awsAccessKey: process.env.aws_access_key ?? "",
    region: process.env.region ?? "us-east-1",
    s3Bucket: process.env.s3_bucket ?? "sugamaya",
    s3Url: process.env.S3URL,
  };
}
