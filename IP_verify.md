IP Verification
This RESTful API empowers developers to expand and enhance their applications with ease, leveraging services such as IP Verification.

You need to have balance, which you can request to topup
You need to have valid API Key, which you can generate. ( https://cloud.plasgate.com/token/ipverification )
You need to be subscribed to our IP Verification Product which can be done by clicking on your profile button and selecting Subcription


IP Authorization Code Flow
Authorization code flow

Redirect Request: The client sends a redirect request to the user’s application/browser, creating a GET request. The client is responsible for generating the necessary parameters to keep track of the session when the user is returned to the client.

To verify a phone number using our API, send an HTTP GET request to the following URL with below parameters:

https://cloudapi.plasgate.com/ip/authenticate

Parameters:

private_key : copy and past your private key that you generate
login_hint : the phone number you want to verify
redirect_uri : the URL to which the response will be redirected after the first request.
scope : requests must include one or more of the following optional scopes: phone_verify, mobile_id. Each scope determines the data returned after authentication. For more details on scope values, refer to the Scopes Explained section.

Parameter	Value/Pattern	Example
phone_number	String	85577696118
private_key	String	xP4tZ_G7fn3Y_Bw6Hj9Z2Y8cRojv7skdQK9xl5pWgHR6N8mH7T3RfV3YsP8vcFk2lgd7w5Xu9MPsoR-PJ3q4S
redirect_uri	String	https://ip-demo.plasgate.com/callback
scope	String	mobile_id phone_verify


Scopes Exaplained

Scopes are used to specify what access privileges are being requested for Access Tokens. Multiple scope values may be used by creating a space-delimited, case-sensitive list of scope values. he scopes associated with Access Tokens determine what resources will be available when they are used
Supported values are: openid, ip:phone_verify, ip:mobile_id, ip:phone, ip:profile. One or more of the custom scopes are required also: phone_verify, mobile_id, phone, profile. Claims can be combined and that combination will define sets of information available as claim values. Every response will contain sub claim:



phone_verify
Scope that will request phone number verification process. For this scope it is required to send login_hint parameter.
After successful authentication, phone_verify will provide the following claim values:



{
  "sub": "99dd91d1-c949-433c-bd9e-0682eb6d6d26",
  "login_hint": "381123456789",
  "phone_number_verified": "true"
}


mobile_id
Scope that will request resolving End-User and generating unique mobileID. When using this scope it is not required to send login_hint parameter in Auth request.
After successful authentication, mobile_id will provide the following claim values:



{
  "sub": "99dd91d1-c949-433c-bd9e-0682eb6d6d26",
  "mobile_id": "2d83f2c1f618313f4b24516913d4e45e00ee289af2bc428d897b175adc5775e643e52bc7286eeca02353e4eb99fccacbe263ec922dbfdde6ed64be90f0e2f780"
}


phone
Scope that will request resolving End-User phone number. When using this scope it is not required to send login_hint parameter in Auth request. Usage of this scope is strictly controlled by the Telco and needs to be approved.
After successful authentication, ip:phone will provide the following claim values:



{
  "sub": "99dd91d1-c949-433c-bd9e-0682eb6d6d26",
  "phone_number": "381123456789"
}


profile
Scope that will request KYC data (Know Your Customer). For this scope it is required to send login_hint parameter in order to do phone number verification process before sharing KYC data.
After successful authentication, ip:profile will provide the following claim values:



{
  "sub": "99dd91d1-c949-433c-bd9e-0682eb6d6d26",
  "given_name": "Teak",
  "family_name": "Omeng",
  "birthdate": "1985-07-10",
  "gender": "male",
  "personal_identification_number": "1234567890",
  "address":    {
                  "street_address": "30 7th 594",
                  "locality": "Phnom Penh City",
                  "postal_code": "12000"
                }
}


Example Response


{
  code : "bb245885-3221-4da7-8b0a-2d352cd906e9.842b5f93-2c70-4df3-930e-d7cd42516c31.e2ac8f37-5d48-468e-b449-aa911c2ce52a",
  private_key : "U4k7_tLbhEGH_rIWYt3Z5A6yFgq3fvwpqK4zn7jCVhHQNO3gk1P9ZvFXUk5cdOj2fjsq9wXZ7JLWu7W-GE2lBX",
  redirect_uri	: "http://ip-demo.plasgate.com/callback",
  session_state	: "842b5f93-2c70-4df3-930e-d7cd42516c31",
  state	: "ea736ff8-dc4d-4ee6-84d4-ebf3948be724"
}




Post request with X-Secret key

With the following parameters returned. Make a post request to https://cloudapi.plasgate.com/ip/ip-auth with X-Secret attached to the header of your request and the returned parameters as json body.


Parameters
Key	Value/Pattern	Example
private_key	String	U4k7_tLbhEGH_rIWYt3Z5A6yFgq3fvwpqK4zn7jCVhHQNO3gk1P9ZvFXUk5cdOj2fjsq9wXZ7JLWu7W-GE2lBX

Headers
Key	Value/Pattern	Example
X-Secret	String	$5$rounds=535000$D8fKlgJ6D5t1uV9h$PZTJgSh8qV2VVoHs4iBl5Q7IKRoUbXSOuFe5nZhPi5D

Body
Key	Value/Pattern	Example
response_type	String	code
state	String	ea736ff8-dc4d-4ee6-84d4-ebf3948be724
redirect_uri	String	https://ip-demo.plasgate.com/callback
code	String	mbb245885-3221-4da7-8b0a-2d352cd906e9.842b5f93-2c70-4df3-930e-d7cd42516c31.e2ac8f37-5d48-468e-b449-aa911c2ce52a

Example Response

If your phone number is sucessfully verified you will receieve the following response :



{
  "error_description":" ",  
  "login_hint": "85577696118",
  "mobile_id":  "15957db0c9ca724a5927d3bd8d3ba04674d74bb719bf5fc6d5747af41d9a1dfe0920f52d1d5ba735ffd144b729dbfa2290e5c0bba1f5bc1de87934d57447db12","phone_number_verified":"true",
  "sid":  "fcf393ab-2555-46e1-8fa8-61b076b60918",
  "status": "success",
  "sub":  "30f4c8df9b8285bd582943071035eca089b90d2075b540450cf461a89c4bdf98"
}




Otherwise, if your phone number is not verified you will receieve the following error response :



{
  "error_description": "Please turn off Wi-Fi or use Mobile data network",
  "login_hint": "85577696119",
  "mobile_id":  "15957db0c9ca724a5927d3bd8d3ba04674d74bb719bf5fc6d5747af41d9a1dfe0920f52d1d5ba735ffd144b729dbfa2290e5c0bba1f5bc1de87934d57447db12",
  "phone_number_verified":  "false","sid":"6f5e972e-3381-4f41-a879-8e7afc89fdd2",
  "status": "failed",
  "sub":  "anonymous"
}


Errors

Failed Authentication/Authorization (403)
If for any reason there is an error during the flow, please check your private key and secret key.


Internal Server Error (500)
Please contact our support or email via support@plasgate.com

