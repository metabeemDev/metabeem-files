import _ from 'lodash';
import express from 'express';
import bodyParser from 'body-parser';
import rateLimit from 'express-rate-limit';
import denetwork_utils from "denetwork-utils";
const { ProcessUtil } = denetwork_utils;
import { httpRoutes } from "./httpRoutes.js";

import 'deyml/config';



export async function runHttp()
{
	return new Promise( async ( resolve, reject ) =>
	{
		try
		{
			const httpPort = _.get( process.env, `HTTP.PORT` );
			if ( ! ProcessUtil.isValidPortNumber( httpPort ) )
			{
				return reject( `invalid HTTP.PORT` );
			}

			const app = express();
			app.disable( 'x-powered-by' );

			//
			//	Set up body-parser to parse JSON data and
			//	limit the request body size to 5MB
			//
			app.use( bodyParser.json( { limit : '5mb' } ) );

			//
			//	create a limiter that
			//	limits each IP address to 100 visits per minute
			//
			const globalLimiter = rateLimit( {
				windowMs : 60 * 1000,	//	1min
				max : 300,		//	Maximum number of requests
				legacyHeaders : false,
				message : `Too many requests, please try again later!`
			} );
			app.use( globalLimiter );

			//
			//	setup http routers
			//
			await httpRoutes( app );

			//	...
			app.listen( httpPort, () =>
			{
				console.log( `Metabeem OSS Server is running on port ${ httpPort }` );
			} );
		}
		catch ( err )
		{
			reject( err );
		}
	} );
}
