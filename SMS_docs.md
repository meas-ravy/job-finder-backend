REST API
The RESTful API allows developers to expand and build their apps on Plasgate. The API makes it easy to send messages to one or many destinations as well as enabling bulk messaging.

If you need to use a stateful tcp protocol (SMPP), please refer to SMPP Server API.

SMS Messages can be transmitted using the RESTful api, the following requirements must be met to enable the service:

You need to have valid API Key, which you can generate
You need to have balance, which you can request to topup
Send a single message
Send a single message to one destination address.

In order to deliver SMS messages, Data is transferred using HTTP POST request at the following URL:

https://cloudapi.plasgate.com/rest/send

Rate Limit: Limited to 200 requests per minute

Params:

private_key : copy and past your private key that you generate
Header:

X-Secret : copy and past your secret key that you generate
Body:

JSON Data

Parameter Value/Pattern Example
sender Text SMS Info
to Number 85512345678
content Text Hello World
There is an additional option to mask content. Place two keywords #ma# around any text you want to mask in the content field.

The keyword #ma# will not appear on the recipient’s device.
The masked text will be displayed as **\*\*** in the transaction report.
Supported multimask area.
Example
curl --location --request POST 'https://cloudapi.plasgate.com/rest/send?private_key=Private Key' --header 'X-Secret: Secret' --header 'Content-Type: application/json' --data-raw '{ "sender": "SMS Info", "to": "855123456789", "content": "Hello from rest API" }'

Request with masked content

curl --location --request POST 'https://cloudapi.plasgate.com/rest/send?private_key=Private Key' --header 'X-Secret: Secret' --header 'Content-Type: application/json' --data-raw '{ "sender": "SMS Info", "to": "855123456789", "content": "Hello from rest #ma#API#ma#" }'
The recipient’s device will get the message as Hello from rest API and Hello from rest \*\*\* will be displayed in the transaction report in this situation.

Send multiple messages
Send multiple messages to one or more destination addresses.

In order to deliver SMS messages, Data is transferred using HTTP POST request at the following URL:

https://cloudapi.plasgate.com/rest/batch-send

Rate Limit: Limited to 100 requests per minute

Params:

private_key : copy and past your private key that you generate (To get private_key Click here)
Header:

X-Secret : copy and past your secret key that you generate (To get X-Secret Click here)
Body:

JSON Data

Parameter Example(s) Description
messages [{“to”: ["85512345678", "85597123456"], “content”: “Hello World”}] Require
globals {“sender”: “SMS Info”} Require
batch_config {“callback_url”: “http://example.com/callback”, “schedule_at”: “2021-09-30 09:00:00”} Optional
Example
curl --location --request POST 'https://cloudapi.plasgate.com/rest/batch-send?private_key=Private Key' --header 'X-Secret: Secret' --data-raw '{ "globals": { "sender": "SMS Info" }, "messages": [ { "to": ["855123456780", "855123456781"], "content": "Hello from rest API" } ] }'

For more example, please visit +Gate REST API document!


** 
HTTP API
This document is targeted at software designers/programmers wishing to integrate SMS messaging as a function into their applications using HTTP protocol, e.g. in connection with WEB-server, unified messaging, information services etc…

If you need to use a stateful tcp protocol (SMPP), please refer to SMPP Server API.

SMS Messages can be transmitted using HTTP protocol, the following requirements must be met to enable the service:

You need a Plasgate user account You need sufficient credit on your user account

Sending
In order to deliver SMS messages, Data is transferred using HTTP POST request at the following URL:

Rate Limit: Limited to 200 requests per minute

https://cloudapi.plasgate.com/api/send

Parameter	Value / Pattern	Example(s)
to	Destination address (required)	855
sender	Originating address (required)	SMS Info
username	Plasgate account login email	example@email.com
password	Account password	Str0ng3P@$$W0rd
dlr	yes or no	yes
dlr_url	HTTP(s) callback URL (optional)	http://example.com/callback
dlr_level	1, 2 or 3	2
dlr_method	GET or POST	GET
content	Text	Hello world !
Example
curl --location --request POST 'https://cloudapi.plasgate.com/api/send' --form 'to="855123456789"' --form 'sender="SMS Info"' --form 'content="Hello from +Gate SMS Cloud"' --form 'username="example@email.com"' --form 'password="Str0ng3P@$$W0rd"'

For more example, please visit +Gate HTTP API document!