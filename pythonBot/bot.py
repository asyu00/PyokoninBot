import discord
import random
import re
from lxml import html
import requests
import json
from selenium import webdriver
import time

TOKEN = '' #insert token here
client = discord.Client()

bullets = []
player = []
index = 0
psuedoIndex = 1

# stalling
driverOn = False
ready = False
gameOn = False

@client.event
async def on_message(message):
    global driverOn
    global ready
    global gameOn
    global bullets
    global player
    global index
    global psuedoIndex

    # we do not want the bot to reply to itself
    if message.author == client.user:
        return
    #if message.content.startswith('uu'):
    #	await client.send_message(message.channel, '!roulette bang')


    # we do not want bot to run !yt command when it is still scraping
    if driverOn:
        return

    # we do not want command to be running before on_ready runs
    if not ready:
        return
    # -------------------------Sample------------------------------
    #if message.content.startswith('!hello'):
    #    msg = 'Hello {0.author.mention} --Python'.format(message)
    #    await client.send_message(message.channel, msg)
    # -------------------------Sample------------------------------

    # Ping Bot
    if message.content.startswith('!ping'):
        msg = 'Pong! *-- Coded with Python*'
        await client.send_message(message.channel, msg)


    # Help
    elif message.content.startswith('!help'):
        msg = ( '--------------Python Pyokonin--------------\r'
                +'List of commands: `!ask, !roll, !choose, !mv, !yt`\r'
                +'`!ask:` ask a yes/no question. Eg. !ask are you happy?'
                +'\r`!roll:` roll dice of a number of your liking. Eg. !roll 20'
                +'\r`!choose:` choose from a list of your items by random, separated by commas. Eg. !choose dog, cat, memes'
                +'\r`!mv, _mv list, !mv "group name":` `!mv` retrieves random MV from database. `!mv list` view list of available groups in database. `!mv "group name"` retrieves random MV of specified group. Eg. !mv stu48')
        await client.send_message(message.author, msg)


    # Roll random
    elif message.content.startswith('!roll'):
        msgAlpha = 'poop'
        number = message.content[6:]
        if number.isdigit():
            roll = random.randint(1, int(number))
            if roll == 1:
                msg = 'You rolled a **1** and got struck by lightning!'
            elif roll < int(number):
                msg = 'You rolled **{}**'.format(roll)
            else:
                msg = ('You rolled a **{}** and is made the king of the world!'.format(roll))
            await client.send_message(message.channel, msg)
        else:
            msg = 'Not a Number!'
            await client.send_message(message.channel, msg)

    # Choose
    elif message.content.startswith('!choose'):
        msgAlpha = message.content[8:]
        if msgAlpha is not None and msgAlpha is not '':
            msgBeta = msgAlpha.split(',')
            rdm = random.randint(0, len(msgBeta)-1)
            msgFinal = re.sub(' +', ' ',msgBeta[rdm])
            if msgFinal is not None and msgFinal is not '':
                msg = '`I chose:` {}!'.format(msgFinal)
                await client.send_message(message.channel, msg)
            else:
                await client.send_message(message.channel, 'Poop!')
        else:
            await client.send_message(message.channel, 'Please enter values!')
    
    # Ask
    elif message.content.startswith('!ask'):
        msgAlpha = message.content[5:]
        if msgAlpha is not None and msgAlpha is not '':
            choice = ['Yes', 'No']
            rdm = random.randint(0, 1)
            msg = '`{}:` {}'.format(msgAlpha, choice[rdm])
            await client.send_message(message.channel, msg)
        else:
            await client.send_message(message.channel, 'Enter a question!')
    

    # MV/Database Server
    elif message.content.startswith('!mv'):
        choice = message.content[4:]
        page = requests.get('http://pyokonin.atspace.cc/test.json')
        mvs = page.json()
        lank = 'Sorry! no link for this MV is available currently!'

        if(choice == ''):
            rdm = random.randint(0, len(mvs))
            name = mvs[rdm]['name']
            link = mvs[rdm]['link']
            if link is not None and link is not '':
                lank = link
            msg = '`{}:`\r{}'.format(name, lank)
            await client.send_message(message.channel, msg)
        else:
            chosenMVs = []
            for mv in mvs:
                for k, v in mv.items():
                    if k == 'groups' and v.upper() == choice.upper():
                        chosenMVs.append(mv)
            if len(chosenMVs) is not 0:
                rdm = random.randint(0, len(chosenMVs))
                chosenMV = chosenMVs[rdm]
                if link is not None and link is not '':
                    lank = link
                msg = '`{}|`\r{}'.format(chosenMV['name'], lank)
                await client.send_message(message.channel, msg)
            else:
                await client.send_message(message.channel, 'Group not found!')

    # Youtube search get first 3 results
    elif message.content.startswith('!yt'):
        query = message.content[4:]
        if query is not None and query is not '':
            fooText = 'Queried by {} | {}'.format(message.author, message.timestamp)
            vids = []
            em = discord.Embed(title="Searching... ", color=0x6cc4ee)
            em.set_author(name=client.user.name, icon_url=client.user.avatar_url)
            msg = await client.send_message(message.channel, embed=em)

            driver=webdriver.Chrome('pythonBot/chromedriver.exe')
            driver.get('https://www.youtube.com/results?search_query={}'.format(query))
            driverOn = True;
            result = driver.find_elements_by_xpath('//a[@id="video-title"]')
            if len(result) > 3:
                for res in range(3):
                    vids.append('{}: ~]|{}'.format(result[res].text, result[res].get_attribute('href')))
            else:
                for res in result:
                    vids.append('{}: ~]|{}'.format(res.text, res.get_attribute('href')))
            
            embed = discord.Embed(title="Search Results:", description="", color=0x6cc4ee)
            embed.set_author(name=client.user.name, icon_url=client.user.avatar_url)
            for vidy in vids:
                vid = vidy.split('~]|')
                embed.add_field(name=vid[0], value=vid[1], inline=False)
            embed.set_footer(text=fooText, icon_url = message.author.avatar_url)
            await client.edit_message(msg, embed=embed)
            driver.quit()
            driverOn = False;
        else:
            await client.send_message(message.channel, 'Please input what to search!')

    # Gets avatar of mentioned member
    elif message.content.startswith('!avatar'):
        usern = message.author
        if message.mentions:
        	usern = message.mentions
        em = discord.Embed(color=0x6cc4ee).set_image(url=usern[0].avatar_url)
        await client.send_message(message.channel, embed=em)

    # Game of russian roulette
    elif message.content.startswith('!roulette'):
    	
        canStop = False
        userna = message.mentions
        cmd = message.content[10:]

        # Only players playing can stop the game
        for i in player:
        	if i == message.author:
        		canStop = True

        # If username is mentioned, check and see if game is running
        if userna:
        	if not gameOn:
        		bullets = ['', '', '', 'dead']
        		player.append(message.author)
        		for play in userna:
        			player.append(play)
        			bullets.append('')
        			bullets.append('')
        		index = 0
        		psuedoIndex = 1
        		await client.send_message(message.channel, 'Starting a game of roulette..!'
        												 + '\r{0.mention}, type "!roulette bang" to shoot!'.format(player[0]))
        		gameOn = True
        	else:
        		await client.send_message(message.channel, 'A game of roulette is currently in progress!')
        		return

        # If command is bang, check if game is running
        elif cmd == 'bang':
        	if gameOn:

        		# Only allow players in game to bang 
        		if player[index] == message.author:
        			rdm = random.randint(0, len(bullets)-1)
        			msg = await client.send_message(message.channel, 'Shooting in 3...')
        			time.sleep(1)
        			for i in range(2, 0, -1):
        				msg = await client.edit_message(msg, 'Shooting in {}...'.format(i))
        				time.sleep(1)
        			await client.edit_message(msg, '**BANG!**')
        			if bullets[rdm] == 'dead':
        				await client.send_message(message.channel,'***{} died :C***'.format(player[index]))
        				gameOn = False
        				bullets = []
        				player = []
        			else:
        				await client.send_message(message.channel, '*{} survived!*'.format(player[index]))
        				await client.send_message(message.channel, '\rYour turn to shoot! {0.mention}'.format(player[psuedoIndex]))
        				bullets.remove('')

	        			# Set index
	        			index = index + 1
	        			psuedoIndex = psuedoIndex + 1
	        			if index > len(player) - 1:
	        				index = 0
	        			if psuedoIndex > len(player) - 1:
	        				psuedoIndex = 0
        		else:
        			await client.send_message(message.channel, 'Not your turn!')
        			return
        	else:
        		await client.send_message(message.channel, 'No game of roulette is running!')
        		return

        elif cmd == 'stop' and canStop:
        	gameOn = False
        	bullets = []
        	player = []
        	await client.send_message(message.channel, 'Game stopped!')
        else:
        	await client.send_message(message.channel, 'Commands for roulette: !roulette @username, !roulette bang, !roulette stop')


    # Testing goes here
    elif message.content.startswith('!t'):
        pass

@client.event
async def on_ready():
    global ready
    print('Logged in as')
    print(client.user.name)
    print(client.user.id)
    print('------------------')
    ready = True

client.run(TOKEN)