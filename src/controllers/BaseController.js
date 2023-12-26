import _ from "lodash";
import { BlobServiceClient, StorageSharedKeyCredential } from "@azure/storage-blob";

import 'deyml/config';


export class BaseController
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

	getAzureSharedKeyCredential()
	{
		return new StorageSharedKeyCredential( this.accountName, this.accountKey );
	}

	getAzureBlobServiceClient()
	{
		const sharedKeyCredential = this.getAzureSharedKeyCredential();
		return new BlobServiceClient(
			`https://${ this.accountName }.blob.core.windows.net`,
			sharedKeyCredential
		);
	}

	getAzureContainerClient()
	{
		const blobServiceClient = this.getAzureBlobServiceClient();
		return blobServiceClient.getContainerClient( this.containerName );
	}
}
