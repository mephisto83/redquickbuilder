import os from 'os';

export default class NameService {
	static projectGenerator(): string {
		let names = `
        Temporary Limousine
Lone Omega
Pure Grim Bulldozer
Haystack Nervous
Helpless Crystal
Small Crystal
Hideous Flannel
Temporary Cosmic
Modern Logbook
Solid Rocky Gravel
Tainted Helpless Windshield
Dead Harsh Zeus
Grotesque Trendy
Star Tasty
Grim Alarm
Meaningful Autumn
Fish Official
Magenta Puppet
Rusty Shower
Helpless Boomerang
Gold Rocky Subdivision
Trendy Heavy
Swift Lion
Lone Beacon Crayon
Forsaken Dog
Big Galaxy
Mysterious Python
Aberrant Moon
Dead Big Hammer
Icy Flannel
Red Spider
Dangerous Screwdriver
Dangerous Tuba
Hungry Helium
Tainted Longitude
Neptune Deserted
Minimum Boomerang
Aberrant Sapphire
Brown Tombstone
Wild Gravel
Tainted Lonesome Artificial
Boomerang Shiny
Hideous Comic
Abandoned Sound
Big Roadrunner
Puppet Lost
Hidden Forgotten Compass
Abandoned Waterbird
Helpless Morbid Trendy
Remote Angry Wrench
Golden Antique
Empty Foot
Sun Sticky
Sleepy Bird
Brave Fierce Space
Remote Butter
Smoke Sleepy
Sapphire Running
Pink Xylophone
White Hammer
Teal Trombone
Creek Sleepy
Dreaded Obscure
Teal Cloud
Fist Running
Temporary Beta
Rusty Knife
Random Crayon
Swift Jupiter
Skunk Persistent
Reborn Moose
Brave Canal
Mountain Aberrant
Dusty Reborn Pottery
Official Mars
Maximum Skunk
Bleeding Vulture
Brave Mountain
Bitter Lama
Severe Tire
Intensive Street
Aggressive Yard
Rapid Laser
Tasty Pluto
Alien Star
Maroon Tiger
Helpless Laser
Plastic Lost
Fierce Tuna
New Severe Electron
Steady Creek
Hideous Aggressive Morning
Boomerang Flaming
Permanent Creek
Gutsy Reborn Crystal
Flying Flannel
Scarlet Mars
Third Eastern Logbook
Appropriate Limousine
Remote Mercury
Bleeding Storm
Solid Galaxy
Scattered Summer
Alien Clown
Temporary Leather
Temporary Drill
Outstanding Crystal
Waterbird Nervous
Maroon Obscure
Deserted Planet
Worthy Clown
Cat Next
Small Proton
Alien Burst
Laser Insane
Pointless Moon
Hot Backpack
Serious Straw Trendy
Teal Monkey
Eyelid Moving
Square Planet
Nocturnal Rhinestone
Pink Notorious
Magenta Reborn Firecracker
Nitrogen Square
Dirty Northernmost Artificial
Pure Heart
Ivory Serpent
Railroad Heavy
Big Silly Planet
Helpless Venus
Maximum Coffin
Digital Xylophone
Rich Risky Hook
Barbaric Gamma
Aimless Long Albatross
Northernmost Epsilon
Bleeding Morning
Alien Bitter Tombstone
Quality Moon
Needless Snake
Orange Scarecrow
Hollow Pottery
Moving Oyster
Boiling Street
Pure Ray
Empty Electrical
Restless Obscure
Third Alpha
Next Planet
Rapid Wooden Vulture
Brown Dog
Massive Bird
Supersonic Lone Tungsten
Dusty Tungsten
Eastern Fist
Disappointed Mercury
Ninth Weather
Confidential Weeknight
Sliding Donut
Pink Warehouse
Empty Essential Leather
Flannel Worthy
Helium Brutal
Vital Itchy Scissors
Lonesome Alpha
Lama Square
Modern Bird
Icy Boomerang
Hollow Electron
Hidden Mars
Strong Trendy
Maximum Snake
Rusty Eyelid
Dead Electron
Freaky Meaningful Compass
Bitter Waffle
Tire Scattered
Persistent Mercury
Global Dead Panther
Sliding Subdivision
Yellow Donut
Sienna Serpent
Supersonic Artificial
Storm Random
Obscure Yellow
Dirty Beam
Zeus Bitter
Sleepy Fox
Pottery Supersonic
New Waterbird
Venom Mysterious
Dreadful Furious Balcony
Dusty Scorpion
Scattered Puppet
Minimum Homeless Subdivision
Sliding Pink Street
Steel Swift
Remote Balcony
Vital Lion
Rusty Morbid Mars
Morbid Old Eagle
Sleepy Logbook
Teal Finger
Neptune Hollow
Intensive Brown Swallow
Flea Remote
Tasty Creek
Everyday Tiger
Grim Locomotive
Lone Arm
Flying Tungsten
Icy Hot Tombstone
Square Subdivision
Furious Obscure
Stormy Foot
Nervous Moon
Solid Jazz
Tasty Flag
Helpless Sound
Supersonic Laser
Viper Full
Furious Longitude
Postal Tainted
White Steel
Small Firecracker
Helpless Pluto
Bitter Cat
Brutal Coffin
Steady Warehouse
Roadrunner Outstanding
Brown Serpent
Small Beam
Heavy Purple Kangaroo
Boomerang Boiling
Barbaric Drill
Teal Pluto
Beacon Green Finger
Risky Gold Scarecrow
Appropriate Small Toupee
Severe Haystack
Orange Locomotive
Surreal Test
Forsaken Obscure
Heavy Alien Moose
Skilled Donut
Persistent Haystack
Wild Streaming Obscure
Western Storm
Scarecrow Gloomy
Flying Hammer
Angry Beta
Long Weather
Parachute Restless
Heart Rich
Intense Rubber
Strong Golden Beta
Wild Omega
Rapid Teal Toothbrush
Navy Panther
Coffin Persistent
Gruesome Strawberry Antique
Albatross Old
Postal Rocky
Waffle Insane
Surreal Locomotive
Maximum Streaming Arm
Gloomy Microphone
Sun Lost
Hideous Dreadful Scoreboard
Intensive Insane Morning
Dancing Microphone
Lantern Third
Golden Parachute
Permanent Gold Tombstone
Gold Lion
Scarlet Crystal
Dancing Parachute
Rebel Notorious
Elastic Venom
Itchy Sledgehammer
Brave Alarm
Random Beacon Breeze
Lobster Golden
Lost Tiger
Modern Mars
Rough Scoreboard
Tungsten Aggressive
Serpent Pure
Minimum Wild Pineapple
Deserted Snake
Toothbrush Nervous
Morbid Hurricane
Empty Peasant
Clown Aimless
Essential Donut
Tainted Scorpion
Yellow Tombstone
Flaming Aimless Moose
Rebel Parachute
Brown Coffin
Bleeding Torpedo
Nervous Storm
Cloudy Crossbow
Official Elastic Toothbrush
Surreal Bulldozer
Red Indigo Sunshine
Grim Notorious
Itchy Tuba
Strong Bitter Coffin
Venom Blue
Screaming Foot
Empty Appropriate Albatross
Trombone Icy
Tasty Outstanding Winter
Rebel Mars
Strong Butter
Strawberry Wrench
Steady Restless Boomerang
Stormy Peasant
Helpless Tuba
Artificial Sad
Remote Butter
Aggressive Hammer
New Space
Pottery Early
Outstanding Serpent
Navy Solid Ostrich
Full Frostbite
Scarlet Accidentally Vulture
Hot Screaming Hurricane
Indigo Railroad
Subtle Flag
Rare Longitude
Solid Rough Mars
Supersonic Eternal Scorpion
Epsilon Hidden
Stormy Dog
Running Fish
Clown Northernmost
Roadrunner Wooden
Artificial Brutal
Endless Dinosaur
Everyday Aggressive Neptune
Persistent Lantern
Orange Tuna
Appropriate Shower
Pineapple Scarlet
Scarlet Accidentally Tea
Wild Space
Strong Viper
Hideous Finger
Supersonic Summer
Intensive Alarm
Viper Ninth
Massive Postal
Disappointed Mountain
Sledgehammer Helpless
Aggressive Coffin
Confidential Alien Longitude
Global Tidy Balcony
Everyday Alpha
Alien Scissors
Eager Foot
Nervous Helpless Bird
Temple Black
Appropriate Hammer
Surreal Obscure
Endless Uranium
Streaming Barbershop`;
		let splitNames = names.split('\n').filter((x) => x.trim());
		let index = Math.floor(Math.random() * splitNames.length);
		return splitNames[index].split(' ').join('_').toLocaleLowerCase();
	}
	static superHeroName(): string {
		let names = `
        Raving Ranger
The Tough Surreal Admiral
The Lobster
Serious Airman
Silly Strong Oyster
Toxic Craw
The Nocturnal Corporal
Ice Kangaroo
Navy Lobster
Dust Oyster
The Guard
The Giant
Duck Eternal
Vicious Electron
Devil Lost Puppet
Lightning Clown
Alien Emperor
The Agent
The Tired Skilled Knight
El Invader
Purple Clown
Timely Gutsy Leader
Flash Mustard
Eagle Flash
Oyster Flaming
The Devil
The Lightning Smuggler
The Scarecrow
Ruthless Anaconda
Pluto Leader
The Gutsy Major
Rider Unpreventable
Gamma Sherif
Red Agent
Ruby Colonel
Pluto Locomotive
Barbaric Leather
Rainbow Invader
Old Craw
Dragonfly Vital
The Duck
El Scarecrow
Ghostly Airman
Snappy Giant
The Serious Devilish Captain
Disappointed Doctor
Dagger Fast
Deserted Psycho
The Sliding Flea
The Eagle
El Major
Sneaky Lieutenant
El Guardian
Dangerous Kangaroo
The Flea
The Severe Doctor
Lone Wild Moose
Silver Hawk
Purple Sherif
Elvish Trollling Gargoyle
Rough Ranger
Green Raven
Eternal Spider
The Deserted Orange Captain
The Bandit
The Rough Raven
Eternal Permanent Dagger
Concrete King
The Strangely Gladiator
Deserted Gargoyle
The Cheerful Wizard
The Scorpion
Purple Wizard
El Rider
Dagger Gutsy
Western Monkey
The Smuggler
Silver Barbarian
Rainbow Moving Hawk
Serious Messenger
Toxic Bandit
Sliding Captain
Flying Skunk
Dangerous Grenade
Surreal Crossbow
Temporary Major
The Surreal Dragonfly
Dagger Supersonic
Ghost Power
The Captain
Monkey Bad
The Striking Grenade
Crossbow Disappointed
Nocturnal Scarecrow
Silver Knight
Eternal Tiger
Green Sword
Tombstone Snappy
Forsaken Leader
Chief Running
The Black Emperor
Northers Ostrich
Cheerful Arrow
Monkey Nervous
Freaky Scorpion
Nasty Boomerang
Forgotten Sword
El Oyster
Silver Foghorn
Nasty Wizard
The Ice Skunk
Golden Dagger
Toxic Lion
Glooming Commander
Lost Devil
The Stony Locomotive
The Craw
Empty Tiger
Epsilon Skeleton
The Lone King
The Stony Sergeant
The Barbarian
White Leather
Danger Neutron
Furious Major
Indigo Gladiator
The Solid Barbarian
The Dragonfly
The Disappointed Ranger
Vital Frostbite
El Spear
King Barbaric
Gamma Liquid Eagle
Nervous Puppet
Temporary Ogre
Sneaky Major
Fierce Unpreventable Smuggler
Bitter Knight
The Timely Roadrunner
Red Psycho
Dancing Warrior
Gamma King
Gamma Falcon
The Psycho
Deserted Ostrich
Morbid Leader
The Screaming Kangaroo
Golden Dinosaur
Silver Giant
El Demon
Mustard Timely
El Bulldozer
Tough Soldier
Jupiter Spear
Headless Solid Doctor
The Foghorn
`;
		let splitNames = names.split('\n').filter((x) => x.trim());
		let index = Math.floor(Math.random() * splitNames.length);
		if (splitNames[0].length > 100) {
			throw 'not right';
		}
		return splitNames[index].split(' ').join('').toLocaleLowerCase();
	}
}
