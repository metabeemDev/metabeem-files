import _ from "lodash";

export class StringUtil
{
	static booleanValue( value )
	{
		if ( _.isString( value ) )
		{
			value = value.trim().toLowerCase();
			if ( 'false' === value || '0' === value )
			{
				return false;
			}
		}

		return Boolean( value );
	}

	/**
	 *	@param str	{any}
	 *	@return {*|null}
	 */
	static removeDoubleQuotesAtBothEnds( str )
	{
		if ( _.isString( str ) )
		{
			return str.replace( /^"|"$/g, '' );
		}

		return null;
	}

	/**
	 *	@param extension	{any}
	 *	@return {boolean}
	 */
	static isValidFileExtension( extension )
	{
		if ( ! _.isString( extension ) || _.isEmpty( extension ) || extension.length > 12 )
		{
			return false;
		}

		const pattern = /^\.[0-9A-Za-z]+$/;
		return pattern.test( extension.trim() );
	}
}
