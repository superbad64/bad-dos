/* Globals */
var replConsole = document.getElementById("repl_console");
var replPrompt = document.getElementById("repl_prompt");
var replInput = document.getElementById("repl_input");
var replHistory = [];
var replHistoryIndex = 0;
var replCwd = [ "C:" ];
var directoryDepth = 0;
var initialWidth = 0;

var sys32DeleteResponse = [ "Figured someone would try this. I know I would !",
				"You're really looking for trouble, aren't you ?",
				"It's a simulacrum of a file system that's read-only anyway; nothing would happen if you deleted that",
				"You can't delete System32 even here mate",
				"..." ];
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
                    "permString": "dr-xr--r--"
                },
                "DOCUME~1": {
                    "fileType": "DIR",
                    "permString": "dr-xr--r--"
                }
            }
        },
        "DOS": {
            "fileType": "DIR",
            "permString": "dr--r--r--",
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
        "AUTOEXEC": {
            "fileType": "BAT",
            "permString": "-r-x------"
        },
        "COMMAND": {
            "fileType": "COM",
            "permString": "-r-x------"
        },
        "CONFIG": {
            "fileType": "SYS",
            "permString": "-r-x------"
        },
        "MOTD": {
            "fileType": "TXT",
            "permString": "-r-x------"
        }
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
			// Re-focus on the input area
			window.location.href = "#repl_input";
			// Adjust width to account for prompt
			replInput.maxLength = 80 - replPrompt.innerHTML.length - 2;

			// Check if input is a valid command
			switch (command[0]) {
				case "":
					break;
				// Built-ins
				case "cd":	// Changes the workdir of the simulated file system
				case "chdir":
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
				case "cls":	// Clears the screen
					replConsole.innerHTML = "";
					break;
				case "del":	// Utterly breaks things if left alone
				case "deltree":
				case "rm":
				case "rmdir":
					if ((replCwd.at(-1) == "DOS") && (command[1] == "System32")) {
						print(sys32DeleteResponse[easterEggIndex] + "<br>");
						if (easterEggIndex + 1 != sys32DeleteResponse.length) {
							easterEggIndex += 1;
						}
					} else {
						print("File system is read-only<br>");	// No deleting anything !
					}
					break;
				case "dir":	// Displays content of current working dir
					print("<br>");
					print("&nbsp;Volume in drive C is BAD-DOS_64<br>");
					print("&nbsp;Volume Serial Number is BAAD-C0D3<br><br>");
					print("&nbsp;Directory: " + replCwd.join("\\") + "<br><br>");

					var checkString = "fs";
					for (let pathlet of replCwd) {
						checkString += "[\"" + pathlet + "\"]";
					}
					var dummy = eval(checkString);

					for (var elem of Object.keys(dummy)) {
						if (dummy[elem]["fileType"]) {
							if (elem.length == 8) {
								print(elem + "\t" + dummy[elem]["fileType"] + "\t" + dummy[elem]["permString"] + "<br>");
							} else {
								print(elem + "\t\t" + dummy[elem]["fileType"] + "\t" + dummy[elem]["permString"] + "<br>");
							}
						}
					}
					if (Object.keys(dummy).length == 0) {
						print("0 items found<br>");
					} else if (Object.keys(dummy).length == 1) {
						print("1 item found<br>");
					} else {
						print(Object.keys(dummy).length + " items found<br>");
					}
					print("<br>");
					break;
				case "echo":	// Displays things. Probably prone to be injected to hell and back
					for (let e of command.slice(1)) {
						print(e + " ");
					}
					print("<br>");
					break;
				case "help":	// Calls 911 for you because computering hard
					if (command.length == 1) {
						print("Welcome to BAD-DOS version 6.4<br>");
						print("Available commands:<br>");
						print("&nbsp;cd chdir cls del deltree dir echo help motd rm rmdir winver<br>");
						print("Type \"help \<command\>\" for more<br>");
					} else {
						switch (command[1]) {
							case "cd":
							case "chdir":
								print("Usage: " + command[1] + " \<dst\><br>");
								print("Changes directory to \<dst\><br>");
								break;
							case "del":
							case "rm":
								print("Usage: " + command[1] + " \<file\><br>");
								print("Deletes file \<file\><br>");
								break;
							case "deltree":
							case "rmdir":
								print("Usage: " + command[1] + " \<dir\><br>");
								print("Recursively deletes directory \<dir\> and all its contents<br>");
								break;
							case "echo":
								print("Usage: echo \<...\><br>");
								print("Prints all following arguments to the command line<br>");
								break;
							case "help":
								print("Usage: help \<command\><br>");
								print("Should hopefully display this exact message !<br>");
								break;
							case "motd":
								print("Usage: motd<br>");
								print("Displays a greeting message<br>");
								break;
							case "winver":
								print("Usage: winver<br>");
								print("Displays current OS version");
								break;
							default:
								print("Unknown command<br>");
								break;
						}
					}
					break;

				case "motd":	// Displays ancient incantations of yore
					print("This program is provided as-is, for free, for educational purposes only<br>");
					print("Does anybody even read those nowadays ?<br>");
					break;
				case "winver":	// *fetch for the neolithic age
					print("<br>");
					print("&nbsp;BAD-DOS version 6.4<br>");
					print("&nbsp;\"I was bored\" - Bad64<br>");
					print("<br>");
					// TODO: Some ASCII art ?
					break;
				default:	// What even did you just enter
					var checkString = "fs";
					for (let pathlet of replCwd) {
						checkString += "[\"" + pathlet + "\"]";
					}
					var dummy = eval(checkString);

					if (Object.keys(dummy).includes(command[0].toUpperCase())) { print("This program is unavailable in the current running mode<br>") }
					else { print("Bad command or file name<br>"); }
					break
			}

			// Add last input to history
			replHistory.push(replInput.value);
			replHistoryIndex += 1;

			// Blank input box
			replInput.value = "";
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

// Adjust width to account for prompt
replInput.maxLength = 80 - replPrompt.innerHTML.length - 2;

// Add a function to focus the input widget regardless of where one clicks in the window
window.onclick = function () { document.getElementById("repl_input").focus(); }
