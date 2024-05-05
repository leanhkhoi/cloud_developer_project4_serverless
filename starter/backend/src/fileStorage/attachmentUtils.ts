import * as AWSXRay from 'aws-xray-sdk'
import * as AWS from 'aws-sdk'

export class AttachmentUtils {
  s3: any
  bucketName: string
  constructor() {
    const XAWS = AWSXRay.captureAWS(AWS)
    this.s3 = new XAWS.S3({ signatureVersion: 'v4' })
    this.bucketName = process.env.ATTACHMENT_S3_BUCKET
  }

  getAttachmentUrl(todoId: string) {
    return `https://${this.bucketName}.s3.amazonaws.com/${todoId}`
  }

  getUploadUrl(todoId: string) {
    const url = this.s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: todoId,
      Expires: 30000
    })
    return url as string
  }
}
