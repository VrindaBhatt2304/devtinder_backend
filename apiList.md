# API List

## authRouter
- post/signup
- post/login
- post/logut

## profileRouter
- get/profile/view
- patch/profile/edit
- patch/profile/password

## connectionRequestRouter
- post/request/send/intrested/:userId
- post/request/send/ignored/:userId
- post/request/review/accepted/:requestId
- post/request/review/rejected/:requestId

## userRouter
- get/connections
- get/requestsReceived
- get/feed 


Status:
ignore,intrested,accepted,rejected