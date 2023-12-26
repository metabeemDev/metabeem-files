import crypto from "crypto";
import path from "path";
import multer from "multer";
import denetwork_utils from "denetwork-utils";

const { WebUtil } = denetwork_utils;
import rateLimit from "express-rate-limit";
import { BaseController } from "./BaseController.js";
import _ from "lodash";
import { StringUtil } from "../utils/StringUtil.js";

export class UploadController extends BaseController
{
	constructor()
	{
		super();

		//	...
		this.routerUpload = `/upload`;

		//	128MB
		this.maxFileSize = 128 * 1024 * 1024;
	}

	uploadSingleFile( router, app )
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
				this.routerUpload = router;

				//
				//	create a limiter that
				//	limits each IP address to x visits per minute
				//
				const limiter = rateLimit( {
					windowMs : 60 * 1000,	//	1min
					max : 10,		//	Maximum number of requests
					legacyHeaders : false,
					message : `Too many requests, please try again later.`
				} );
				app.use( this.routerUpload, limiter );

				//
				//	Set up multer to handle file uploads and
				//	limit file size to 128MB
				//
				const storage = multer.memoryStorage();
				const upload = multer( {
					storage : storage,
					limits : { fileSize : this.maxFileSize }
				} );

				app.post( this.routerUpload, upload.single( 'file' ), async ( req, res ) =>
				{
					try
					{
						if ( ! req.file )
						{
							return res.status( 400 ).send( 'No file uploaded' );
						}

						const extName = path.extname( req.file.originalname );
						if ( ! StringUtil.isValidFileExtension( extName ) )
						{
							return res.status( 400 ).send( 'invalid file extension' );
						}

						//	...
						const fileBuffer = req.file.buffer;
						const sha256sum = crypto.createHash( 'sha256' )
							.update( fileBuffer )
							.digest( 'hex' );
						const filename = `${ sha256sum }${ extName }`;

						const blockBlobClient = this.getAzureContainerClient()
							.getBlockBlobClient( filename );
						await blockBlobClient.upload( fileBuffer, fileBuffer.length );

						const response = WebUtil.getResponseObject(
							{ filename : filename, },
							{ error : `file uploaded successfully` }
						);
						res.status( 200 ).send( response );
					}
					catch ( error )
					{
						console.error( error );
						res.status( 500 ).send( WebUtil.getResponseObject(
							{},
							{ error : `Internal Server Error` }
						) );
					}
				}, ( err, req, res, next ) =>
				{
					//	Error handling middleware to handle Multer's file size exceedance error
					if ( err instanceof multer.MulterError )
					{
						//	Multer error, file size exceeded
						res.status( 400 ).send( WebUtil.getResponseObject(
							{},
							{ error : `File size exceeds the limit ${ this.maxFileSize / 1024 / 1024 }MB` }
						) );
					}
					else
					{
						//	Other errors
						res.status( 500 ).send( WebUtil.getResponseObject(
							{},
							{ error : `Internal Server Error` }
						) );
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
