# Bid bot for Slack
Slackbot that will assist in _bid poker_ style estimations for tasks in an Agile sprint estimations meeting.

# Why use it
Bid style estimations are great for getting participation and input from all team members. However, it only works well if bids are given honestly without influence from team members that bid early. This can be especially hard for remote teams that need to use a chat client to submit bids. The bot allows all users to bid without displaying to the group the bid values until all bids have been submitted.

# How do you use it

<iframe width="560" height="315" src="https://www.youtube.com/embed/nkNcH0NL2co" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>

1. Invite the bot _@dealer_ to the estimations room
2. Tell the bot to start accepting bids for a task
3. In a private channel each member the the team should share their bid with the bot
4. When all bids are in the bot will display all the bids

# How does it work
This creates a service using Express and interfaces with APIs for both Slack and Wit.ai. Slack APIs allow for the bot to interact with team members via chat messages. Wit.ai provides natural language processing to understand chat messages. The bot should work to Stop/Start/Restart bidding on a task and it should accept a bid value for each task.

# Feature Wishlist
* "@dealer what can you do?" -> get list of things that bot can do
* "@dealer re-bid last task." -> re-start or stop bid
* "@dealer what are bids for ENG-123?" -> get update on bids
* "@dealer what are all of todays bids?" -> get list of all tasks/bids in session
* "@dealer start new session." -> start/end/clear bidding sessions
* "@dealer set bid timeout of 2 min." -> get/set/use timer for bids; end bidding early if time expires
* allow concurrent task bids
* message hand/currenttask updates to team and as IMs
* no longer require '@dealer' in direct messages
