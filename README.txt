Hello! This will be the technical document guiding you on how to host this bot for yourself.

This bot requires Node to be installed on your current PC. It also uses Discord.js

First Time Start Up:
1. Make sure you have all required dependancies. They should be already included but just in case, check package.json for more info.
2. Insert your Discord generated bot token in the file marked as config.json
3. Insert your application client id and guild ID in deploy-commands.js
4. Open terminal. Navigate to the bot folder with 'cd'.
5. Run 'node deploy-commands.js' (This loads slash commands onto the server.)

NOTE: If you edit any of the commands, you need to run 'node deploy-commands.js' from Steps 4 & 5 again.

Bot Start:
1. Open terminal. Navigate to the bot folder with 'cd'.
2. Run 'node index.js'
3. If everything connected, it's that simple!
