# VI_DinaTask


## Installation
 1. docker-compose up - will build the image for redis and my app and start it 
 2. docker-compose down - will shout down the related dockers contains 
 3. docker ps -a  -  to check docker containers, and stop or start one of them by demand
 
 
## Run book :
below is the description of API for each question :

 1. Which Marvel movies did each actor play in? 
      - by actor  GET <host>:<port>/marvelByActor?actor="<actor name>"
      - all actors  GET <host>:<port>/marvelByActor
      
 2. Actors who played more than one Marvel character? -  GET <host>:<port>/whoPlayManyMarvel 
 
 3. Are there 2 different actors who played the same role? - GET <host>:<port>/actorByMarvelRole
 
 4. in order to reload the changed data you can use : GET <host>:<port>/reloadData 
    or you can pass env variable 
    
## Who it was implemented: 

* on Server load all required data inserted in to Redis (caching)
  in order to provide better and faster response to client in run time 

* each time the API is invoked its retrieve data from Redis

* there are one more API that allow user to reload(worm again) the Redis cache with new /updated data

* on load there is an Env variable that can be provided - if its false- the cache will not be reloaded  
 

## Assumptions : 
 Actor name, Movie name and role name are strings and compared as string 
 means :   "Tony Stark / Iron Man" **!=**  "Tony Stark (uncredited)"
