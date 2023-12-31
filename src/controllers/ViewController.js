import rateLimit from "express-rate-limit";
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
					legacyHeaders : false,
					message : `Too many requests, please try again later.`
				} );
				app.use( this.routerView, limiter );

				//	...
				app.get( this.routerView, async ( req, res ) =>
				{
					try
					{
						const blobName = req.query.file;
						const redirect = StringUtil.booleanValue( req.query.rd );

						if ( ! _.isString( blobName ) || _.isEmpty( blobName ) )
						{
							return res.status( 400 ).send( WebUtil.getResponseObject(
								400,
								{},
								{ error : `invalid URL parameter file` }
							) );
						}

						const blobInfo = await this.azureBlobService.queryBlobInfo( blobName );
						if ( redirect )
						{
							res.redirect( 302, blobInfo.sasUrl );
						}
						else
						{
							const response = WebUtil.getResponseObject( 200, blobInfo );
							res.status( 200 ).send( response );
						}
					}
					catch ( error )
					{
						console.error( error );
						let statusCode = _.get( error, `statusCode` );
						if ( 404 === statusCode )
						{
							res.status( 404 ).send( WebUtil.getResponseObject( 404, {},
								{ error : `File Not Found` }
							) );
						}
						else
						{
							res.status( 500 ).send( WebUtil.getResponseObject( 500, {},
								{ error : `Internal Server Error` }
							) );
						}
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
