import rateLimit from "express-rate-limit";
import {
	generateBlobSASQueryParameters,
} from '@azure/storage-blob';
import { BaseController } from "./BaseController.js";
import denetwork_utils from "denetwork-utils";
import _ from "lodash";
import { StringUtil } from "../utils/StringUtil.js";

const { WebUtil } = denetwork_utils;


export class ViewController extends BaseController
{
	constructor()
	{
		super();

		//	...
		this.routerView = '/view';
	}

	viewSingleFile( router, app )
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				if ( ! _.isString( router ) || _.isEmpty( router ) )
				{
					return reject( `${ this.constructor.name } :: invalid router` );
				}
				if ( ! app )
				{
					return reject( `${ this.constructor.name } :: invalid app` );
				}

				//	...
				this.routerView = router;

				//
				//	create a limiter that
				//	limits each IP address to x visits per minute
				//
				const limiter = rateLimit( {
					windowMs : 5 * 1000,	//	1min
					max : 5,		//	Maximum number of requests
					message : `Too many requests, please try again later.`
				} );
				app.use( this.routerView, limiter );

				//	...
				const containerName = this.containerName;

				app.get( this.routerView, async ( req, res ) =>
				{
					try
					{
						const blobName = req.query.file;
						if ( ! _.isString( blobName ) || _.isEmpty( blobName ) )
						{
							return res.status( 400 ).send( WebUtil.getResponseObject(
								{},
								{ error : `invalid URL parameter file` }
							) );
						}

						//	Generate SAS token for the blob
						const sasToken = generateBlobSASQueryParameters(
							{
								containerName,
								blobName,
								permissions : 'r', 			// 'r' for read permission, adjust as needed
								startsOn : new Date( new Date().getTime() - 60 * 60 * 1000 ),	//	Optional: start time
								expiresOn : new Date( new Date().getTime() + 60 * 60 * 1000 ),	//	Optional: expiry time
							},
							this.getAzureSharedKeyCredential()
						).toString();

						//	Create a SAS URL for the blob
						const blobClient = this.getAzureContainerClient().getBlobClient( blobName );
						const sasUrl = blobClient.url + '?' + sasToken;

						//	Get the blob's properties to obtain the Content-Type
						const blobProperties = await blobClient.getProperties();
						const createdOn = blobProperties ? blobProperties.createdOn : null;
						const lastModified = blobProperties ? blobProperties.lastModified : null;
						const etag = blobProperties ? blobProperties.etag : null;

						const blobData = {
							properties : {
								createdOn : createdOn ? createdOn.getTime() : null,
								lastModified : lastModified ? lastModified.getTime() : null,
								contentLength : blobProperties ? blobProperties.contentLength : null,
								contentType : blobProperties ? blobProperties.contentType : null,
								etag : StringUtil.removeDoubleQuotesAtBothEnds( etag ),
								version : blobProperties ? blobProperties.version : null,
							},
							sasUrl : sasUrl,
						};

						const response = WebUtil.getResponseObject( blobData );
						res.status( 200 ).send( response );
					}
					catch ( error )
					{
						console.error( error );
						const response = WebUtil.getResponseObject(
							{},
							{ error : `Internal Server Error` }
						);
						res.status( 500 ).send( response );
					}
				} );

				//	...
				resolve( true );
			}
			catch ( err )
			{
				reject( err );
			}
		} );
	}
}
