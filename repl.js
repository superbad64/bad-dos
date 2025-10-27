/* Globals */
var replConsole = document.getElementById("repl_console");
var replPrompt = document.getElementById("repl_prompt");
var replInput = document.getElementById("repl_input");
var replHistory = [];
var replHistoryIndex = 0;
var replCwd = [ "C:", "USERS", "GUEST" ];
var directoryDepth = 0;
var initialWidth = 0;

var sys32DeleteResponse = [ "Can't let you do that, Star Fox !",
				"Figured someone would try this. I know I would !",
				"It's a simulacrum of a file system that's read-only anyway; nothing would happen if you deleted that",
				"You're really looking for trouble, aren't you ?",
				"...",
				"...",
				"...",
				"...",
				"...",
				"...",
				"...",
				"...",
				"...",
				"...You just don't quit, huh ?",
				"Alright. I'll let you. Enter that command one more time..." ];
var easterEggIndex = 0;

replInput.addEventListener("keydown", replEval);

/* Virtual file system */
var fs = {
    "C:": {
        "fileType": "DIR",
        "permstring": "dr--r--r--",
        "USERS": {
            "fileType": "DIR",
            "permString": "dr--r--r--",
            "BAD64": {
                "fileType": "DIR",
                "permString": "d---------"
            },
            "GUEST": {
				"fileType": "DIR",
                "permString": "drwxr-xr--",
                "DESKTOP": {
                    "fileType": "DIR",
                    "permString": "dr-xr--r--",
					"STYLES": {
                    "fileType": "EXE",
                    "permString": "-r-xr-xr-x"
                }
                },
                "DOCUME~1": {
                    "fileType": "DIR",
                    "permString": "dr-xr--r--"
                },
				"AUTOEXEC": {
					"fileType": "BAT",
					"permString": "-r-xr-xr-x"
				},
				"COMMAND": {
					"fileType": "COM",
					"permString": "-r-xr-xr-x"
				},
				"CONFIG": {
					"fileType": "SYS",
					"permString": "-r--r--r--"
				},
				"MOTD": {
					"fileType": "TXT",
					"permString": "-rwxr--r--"
				}
            }
        },
        "DOS": {
            "fileType": "DIR",
            "permString": "dr-xr-xr-x",
			"BIN": {
                "fileType": "DIR",
                "permString": "dr-xr-xr-x",
				"CD": {
					"fileType": "LNK",
					"permString": "-r-xr-xr-x"
				},
				"CHDIR": {
					"fileType": "EXE",
					"permString": "-r-xr-xr-x"
				},
				"CLS": {
					"fileType": "EXE",
					"permString": "-r-xr-xr-x"
				},
				"DEL": {
					"fileType": "EXE",
					"permString": "-r-xr-xr-x"
				},
				"DELTREE": {
					"fileType": "EXE",
					"permString": "-r-xr-xr-x"
				},
				"DIR": {
					"fileType": "EXE",
					"permString": "-r-xr-xr-x"
				},
				"ECHO": {
					"fileType": "EXE",
					"permString": "-r-xr-xr-x"
				},
				"EMM386": {
					"fileType": "EXE",
					"permString": "-r--------"
				},
				"HELP": {
					"fileType": "EXE",
					"permString": "-r-xr-xr-x"
				},
				"HIMEM": {
					"fileType": "EXE",
					"permString": "-r--------"
				},
				"RM": {
					"fileType": "LNK",
					"permString": "-r-xr-xr-x"
				},
				"RMDIR": {
					"fileType": "LNK",
					"permString": "-r-xr-xr-x"
				},
				"WINVER": {
					"fileType": "EXE",
					"permString": "-r-xr-xr-x"
				}
            },
			"BOOT": {
                "fileType": "DIR",
                "permString": "d-------"
            },
			"OEM": {
                "fileType": "DIR",
                "permString": "d-------"
            },
            "SYSTEM32": {
                "fileType": "DIR",
                "permString": "d-------"
            }
        },
    }
};

function print(arg) {
	// ...yeah
	replConsole.innerHTML += arg;
}

function replEval(e) {
	// Callback function wearing sunglasses and a fake mustache
	switch (`${e.code}`) {
		case "Enter":
			// Add fresh input to the console window
			print(replPrompt.innerHTML + replInput.value + "<br>");
			var command = replInput.value.split(' ');

			// Check if input is a valid command
			switch (command[0].toUpperCase()) {
				case "":
					break;
				// Built-ins
				case "CD":	// Changes the workdir of the simulated file system
				case "CHDIR":
					// Prevent directory traversal attack (as if that was a thing on a VFS)
					if ((replCwd.length == 1) && (command[1] == "..")) {
						print("Access denied<br>");
					}
					else if ((replCwd.length > 1) && (command[1] == "..")) {
						replCwd.pop();
						if (replCwd.length == 1) { replPrompt.innerHTML = "C:\\>"; }
						else { replPrompt.innerHTML = replCwd.join("\\") + "\\>"; }
					}
					else {
						// Actually process changing directories
						var tempCwd = replCwd.concat(command[1].toUpperCase());

						var checkString = "fs";
						for (let pathlet of tempCwd) {
							checkString += "[\"" + pathlet + "\"]";
						}
						var dummy = eval(checkString);

						try {
							if (dummy["fileType"] == "DIR") {
								if (dummy["permString"][1] == 'r') {
									replCwd = tempCwd;
									replPrompt.innerHTML = replCwd.join("\\") + "\\>";
								} else {
									print("Access denied<br>");
								}
							} else {
								print("Invalid directory<br>");
							}
						} catch (error) {	// That shouldn't happen (anymore)
							console.error(error);
							print("Invalid directory<br>");
						}
					}
					break;
				case "CLS":	// Clears the screen
					replConsole.innerHTML = "";
					break;
				case "DEL":	// Utterly breaks things if left alone
				case "DELTREE":
				case "RM":
				case "RMDIR":
					if ((replCwd.at(-1) == "DOS") && (command[1].toUpperCase() == "SYSTEM32")) {
						print(sys32DeleteResponse[easterEggIndex] + "<br>");
						if (easterEggIndex + 1 != sys32DeleteResponse.length + 1) {
							easterEggIndex += 1;
						} else {
							// Told ya
							replPrompt.remove();
							replInput.remove();
							replConsole.style.color = "white";
							replConsole.style.backgroundColor = "darkblue";

							var html = document.getElementsByTagName("html")[0];
							html.style.backgroundColor = "darkblue";
							html.style.overflow = "hidden";

							replConsole.innerHTML = "<pre>";
							replConsole.innerHTML += "A problem has been detected and BAD-DOS has been shut down to prevent damage to your computer.<br>";
							replConsole.innerHTML += "<br>";
							replConsole.innerHTML += "ERR_STUBBORN_AHH_USER<br>";
							replConsole.innerHTML += "<br>"
							replConsole.innerHTML += "If this is the first time you've seen this error screen, restart your computer. If this screen appears again, consider touching grass.<br>";
							replConsole.innerHTML += "<br>"
							replConsole.innerHTML += "Technical Information:<br>"
							replConsole.innerHTML += "<br>";
							replConsole.innerHTML += "*** STOP: 0x5F3759DF (0xDEADBEEF, 0xABBACABB, 0xABADD00D, 0xDEFEC8ED)";
							replConsole.innerHTML += "<pre>"
						}
					} else {
						print("File system is read-only<br>");	// No deleting anything !
					}
					break;
				case "DIR":	// Displays content of current working dir
					print("<br>");
					print(" Volume in drive C is BAD-DOS_64<br>");
					print(" Volume Serial Number is BAAD-C0D3<br><br>");
					print(" Directory: " + replCwd.join("\\") + "<br><br>");

					var checkString = "fs";
					for (let pathlet of replCwd) {
						checkString += "[\"" + pathlet + "\"]";
					}
					var dummy = eval(checkString);

					for (var elem of Object.keys(dummy)) {
						if (dummy[elem]["fileType"]) {
							if (elem.length > 7) {
								print(elem + "\t" + dummy[elem]["fileType"] + "\t" + dummy[elem]["permString"] + "<br>");
							} else {
								print(elem + "\t\t" + dummy[elem]["fileType"] + "\t" + dummy[elem]["permString"] + "<br>");
							}
						}
					}
					if (Object.keys(dummy).length - 2 == 0) {
						print("0 items found<br>");
					} else if (Object.keys(dummy).length - 2 == 1) {
						print("1 item found<br>");
					} else {
						print((Object.keys(dummy).length - 2) + " items found<br>");
					}
					print("<br>");
					break;
				case "ECHO":	// Displays things. Probably prone to be injected to hell and back
					for (let e of command.slice(1)) {
						print(e + " ");
					}
					print("<br>");
					break;
				case "HELP":	// Calls 911 for you because computering hard
					if (command.length == 1) {
						print("Welcome to BAD-DOS version 6.4<br>");
						print("Available commands:<br>");
						print(" cd chdir cls del deltree dir echo help motd rm rmdir winver<br>");
						print("Type \"help \<command\>\" for more<br>");
					} else {
						switch (command[1].toUpperCase()) {
							case "CD":
							case "CHDIR":
								print("Usage: " + command[1].toUpperCase() + " \<dst\><br>");
								print("Changes directory to \<dst\><br>");
								break;
							case "DEL":
							case "RM":
								print("Usage: " + command[1].toUpperCase() + " \<file\><br>");
								print("Deletes file \<file\><br>");
								break;
							case "DELTREE":
							case "RMDIR":
								print("Usage: " + command[1].toUpperCase() + " \<dir\><br>");
								print("Recursively deletes directory \<dir\> and all its contents<br>");
								break;
							case "ECHO":
								print("Usage: ECHO \<...\><br>");
								print("Prints all following arguments to the command line<br>");
								break;
							case "HELP":
								print("Usage: HELP \<command\><br>");
								print("Should hopefully display this exact message !<br>");
								break;
							case "MOTD":
								print("Usage: MOTD<br>");
								print("Displays a greeting message<br>");
								break;
							case "WINVER":
								print("Usage: WINVER<br>");
								print("Displays current OS version");
								break;
							default:
								print("Unknown command<br>");
								break;
						}
					}
					break;
				case "STYLES":
					if (replCwd.at(-1) == "DESKTOP") {
						window.parent.postMessage("Hi", "*");
					} else {
						print("Bad command or file name<br>");
					}
					break;
				case "WINVER":	// *fetch for the neolithic age
					print("<br>");
					print(" BAD-DOS version 6.4<br>");
					print(" \"I was bored\" - Bad64<br>");
					print("<br>");
					// TODO: Some ASCII art ?
					break;
				default:	// What even did you just enter
					var checkString = "fs";
					for (let pathlet of replCwd) {
						checkString += "[\"" + pathlet + "\"]";
					}
					var dummy = eval(checkString);
					console.log(dummy);

					if (Object.keys(dummy).includes(command[0].toUpperCase())) {
						try {
							import("./bin/" + command[0].toLowerCase() + ".js").then(cmd => {
								print(cmd.default());
							}).catch(error => { print("Bad command or file name<br>"); });
						} catch (error) {
							print("Bad command or file name<br>");
						}
					}
					else { print("Bad command or file name<br>"); }
					break;
			}

			// Add last input to history
			replHistory.push(replInput.value);
			replHistoryIndex += 1;

			// Blank input box
			replInput.value = "";

			// Adjust input size to account for prompt size
			replInput.maxLength = 80 - replPrompt.innerHTML.length - 2;
			replPrompt.style.width = (replPrompt.getBoundingClientRect().right - replPrompt.getBoundingClientRect().left) + "px";

			if ((380 - parseInt(replPrompt.style.width.slice(0, -2))) <= 250) {
				replInput.style.width = (380 - parseInt(replPrompt.style.width.slice(0, -2))) + "px";
			} else {
				replInput.style.width = "250px";
			}

			// Re-focus on the input area
			window.location.replace("repl.shtml#repl_input");
			break;
		case "ArrowUp":
			if (replHistoryIndex - 1 >= 0) {
				replHistoryIndex -= 1;
				replInput.value = replHistory[replHistoryIndex];
			}
			break;
		case "ArrowDown":
			if (replHistoryIndex + 1 < replHistory.length) {
				replHistoryIndex += 1;
				replInput.value = replHistory[replHistoryIndex];
				console.log(replHistoryIndex);
			} else if (replHistoryIndex + 1 == replHistory.length) {
				replHistoryIndex += 1;
				replInput.value = "";
			}
			break;
	}
}

/* Startup */
print("Starting BAD-DOS...<br><br>");

// Set prompt
replPrompt.innerHTML = replCwd.join("\\") + "\\>";

// Get initial width parameter
initialWidth = document.getElementsByTagName("body")[0].getBoundingClientRect().right - document.getElementsByTagName("body")[0].getBoundingClientRect().left;

// Adjust width to account for prompt
replInput.maxLength = 80 - replPrompt.innerHTML.length - 2;
replPrompt.style.width = (replPrompt.getBoundingClientRect().right - replPrompt.getBoundingClientRect().left) + "px";

if ((380 - parseInt(replPrompt.style.width.slice(0, -2))) <= 250) {
	replInput.style.width = (380 - parseInt(replPrompt.style.width.slice(0, -2))) + "px";
} else {
	replInput.style.width = "250px";
}

// Add a function to focus the input widget regardless of where one clicks in the window
window.onclick = function () { document.getElementById("repl_input").focus(); }