# 3-a
Used sky.jpg from discord student who posted picture from textbook.
Found ground.jpg online:
https://opengameart.org/content/tiny-texture-pack-grass-1-256x256png

I partially used ChatGPT for help during this assignment and I have noted it in the comments of my code.
I apologize for the messy/late submission. I ran into some issues this Quarter but I am almost all caught up!

I had a lot of fun working on this assignment and learning more about perspectives. Implementing the camera movement for this assignment really helped solidify my understanding of how the different features of eye, at, and up worked with eachother. For this assignment, I did not have the time to implement the add/delete block feature, but I got closer. Right now, there is some starter code that was meant to track when the user clicked and was looking at the main map. In console, it should display "it works!" when the user clicks on the general direction of the map. This is done by creating a directional vector and going down that until my coordinate matches one of a block. From here, I could have detected which block was detected and add or delete depending on what the user clicks. I may implement this on a future date outside of this assignment since it sounds like a fun thing to add.
<br>

Regarding the camera movement, to make it smoother, what I did was that I created variables to keep track of w,a,s,d,q, and e. These would be updated on 2 factors of .mousedown and .mouseup. I used a flag variable to make sure these get updated. I then updated the location of camera accordingly in my tick() (so 60 frames/times per second with a 60fps run for example). This updates the location very smoothly. I originally implemented the camera movement in a way that worked correctly some of the time. I went to Rohan's office hours and he pointed me towards the Canvas assignment page which actually had a neat explanation of how to do it in a better way in my Camera class, which is what I then used. Major thanks to Rohan for his help throughout the quarter.

<br>
My World is supposed to be a Minecraft skyblock server, except I added the twist of adding lava to the bottom of the world so that the user does not just not fall forever, but rather into certain death :D
Incase you don't know what skyblock is, it is an old popular minecraft gamemode where a user is spawned in on a floating island and has to survive given only the resources on the island. One major thing is that the user can plant trees and other things to get more material. They can also use a cobble stone generator for more cobble/stone. In my map, the user has a tree planted as well as 2 cane sugar farm areas. These areas are made of sand with water on the inside to help grow the cane sugar.
The story of this game is basically the user has to survive as long as possible and maybe build their own universe.

<br>
I was also able to get the cursor movement working (after WAYY too much time). It was actually a lot easier once I implemented my Camera class properly. I added 2 more functions there to function for my looking up and down.
