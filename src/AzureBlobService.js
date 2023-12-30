import _ from "lodash";
import { BlobServiceClient, generateBlobSASQueryParameters, StorageSharedKeyCredential } from "@azure/storage-blob";

import 'deyml/config';

export class AzureBlobService
{
	constructor()
	{
		this.accountName = _.get( process.env, `OSS.ACCOUNT.NAME` );
		this.accountKey = _.get( process.env, `OSS.ACCOUNT.KEY` );
		this.containerName = _.get( process.env, `OSS.CONTAINER.NAME` );

		if ( ! _.isString( this.accountName ) || _.isEmpty( this.accountName ) )
		{
			throw new Error( `invalid OSS.ACCOUNT.NAME` );
		}
		if ( ! _.isString( this.accountKey ) || _.isEmpty( this.accountKey ) )
		{
			throw new Error( `invalid OSS.ACCOUNT.KEY` );
		}
		if ( ! _.isString( this.containerName ) || _.isEmpty( this.containerName ) )
		{
			throw new Error( `invalid OSS.CONTAINER.NAME` );
		}
	}

	getSharedKeyCredential()
	{
		return new StorageSharedKeyCredential( this.accountName, this.accountKey );
	}

	getBlobServiceClient()
	{
		const sharedKeyCredential = this.getSharedKeyCredential();
		return new BlobServiceClient(
			`https://${ this.accountName }.blob.core.windows.net`,
			sharedKeyCredential
		);
	}

	getContainerClient()
	{
		const blobServiceClient = this.getBlobServiceClient();
		return blobServiceClient.getContainerClient( this.containerName );
	}

	queryBlobInfo( blobName )
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				if ( ! _.isString( blobName ) || _.isEmpty( blobName ) )
				{
					return reject( `${ this.constructor.name } :: invalid blobName` );
				}

				//	...
				const containerName = this.containerName;

				//	Generate SAS token for the blob
				const sasToken = generateBlobSASQueryParameters(
					{
						containerName,
						blobName,
						permissions : 'r', 			// 'r' for read permission, adjust as needed
						startsOn : new Date( new Date().getTime() - 60 * 60 * 1000 ),	//	Optional: start time
						expiresOn : new Date( new Date().getTime() + 60 * 60 * 1000 ),	//	Optional: expiry time
					},
					this.getSharedKeyCredential()
				).toString();

				//	Create a SAS URL for the blob
				const blobClient = this.getContainerClient().getBlobClient( blobName );
				const sasUrl = blobClient.url + '?' + sasToken;

				//	Get the blob's properties to obtain the Content-Type
				const blobProperties = await blobClient.getProperties();
				const createdOn = blobProperties ? blobProperties.createdOn : null;
				const lastModified = blobProperties ? blobProperties.lastModified : null;

				const blobInfo = {
					properties : {
						createdOn : createdOn ? createdOn.getTime() : null,
						lastModified : lastModified ? lastModified.getTime() : null,
						contentLength : blobProperties ? blobProperties.contentLength : null,
						contentType : blobProperties ? blobProperties.contentType : null,
						etag : blobProperties ? blobProperties.etag : null,
						version : blobProperties ? blobProperties.version : null,
					},
					blobName : blobName,
					sasUrl : sasUrl,
				};

				resolve( blobInfo );
			}
			catch ( err )
			{
				reject( err );
			}
		});
	}
}
