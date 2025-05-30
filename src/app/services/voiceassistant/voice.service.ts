import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common'; // Import Angular's Location service
import nlp from 'compromise'; // Import the compromise NLP library
import { DataService } from '../data/data.service'; // Import the DataService

@Injectable({
  providedIn: 'root',
})
export class VoiceAssistantService {
  private recognition: any;
  private isListeningForWakeWord: boolean = true; // Start in wake word detection mode

  constructor(
    private router: Router,
    private location: Location, // Inject the Location service
    private dataService: DataService
  ) {
    this.initializeSpeechRecognition();
  }

  private initializeSpeechRecognition(): void {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Speech recognition is not supported in this browser.');
      return;
    }
  
    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'en-US';
    this.recognition.interimResults = false;
    this.recognition.continuous = true; // Enable continuous listening
  
    this.recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
      console.log('Voice input received:', transcript);
  
      if (this.isListeningForWakeWord) {
        // Normalize the input and check for variations of the wake word
        const normalizedTranscript = transcript.replace(/[^a-zA-Z0-9\s]/g, '').trim(); // Remove punctuation
        if (this.isWakeWord(normalizedTranscript)) {
          console.log('Wake word detected!');
          this.isListeningForWakeWord = false; // Switch to command mode
          this.speak('I am listening.');
        }
      } else {
        // Process the command
        this.handleCommand(transcript);
        this.isListeningForWakeWord = true; // Return to wake word detection mode
      }
    };
  
    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
    };
  
    this.recognition.onend = () => {
      console.log('Speech recognition ended. Restarting...');
      this.startListening(); // Restart listening for the wake word
    };
  }
  
  private isWakeWord(input: string): boolean {
    // List of wake word variations
    const wakeWords = [
      'hey daf',
      'hey, daf',
      'hi daf',
      'hello daf',
      'head off',
      'k duff',
      'hey deaf',
      'hey nath',
      'hair daf',
    ];
  
    // Check for exact match or phonetic similarity
    return wakeWords.some((word) => this.isPhoneticallySimilar(input, word));
  }
  
  private isPhoneticallySimilar(input: string, target: string): boolean {
    // Use a simple phonetic similarity algorithm (e.g., Levenshtein distance or soundex)
    const levenshteinDistance = (a: string, b: string): number => {
      const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
      for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
      for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  
      for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
          const cost = a[i - 1] === b[j - 1] ? 0 : 1;
          matrix[i][j] = Math.min(
            matrix[i - 1][j] + 1, // Deletion
            matrix[i][j - 1] + 1, // Insertion
            matrix[i - 1][j - 1] + cost // Substitution
          );
        }
      }
      return matrix[a.length][b.length];
    };
  
    const distance = levenshteinDistance(input, target);
    const similarityThreshold = 2; // Allow up to 2 character differences
    return distance <= similarityThreshold;
  }

  startListening(): void {
    if (!this.recognition) {
      console.error('Speech recognition is not supported in this browser.');
      return;
    }

    this.recognition.start();
    console.log('Voice assistant started listening for wake word.');
  }

  private handleCommand(command: string): void {
    const doc = nlp(command); // Use compromise to process the command


      // Check if the command is a login-related request
    if (this.handleLoginCommand(command)) {
      return;
    }
    // Check if the command is a navigation request
    if (this.handleNavigationCommand(doc, command)) {
      return;
    }

    // Check if the command is a data query
    if (this.handleDataQuery(doc, command)) {
      return;
    }

    // If no intent matches, handle unknown command
    this.speak('Sorry, I did not understand the command.');
    console.log('Unknown command:', command);
  }

    private setInputValue(field: 'username' | 'password', value: string): void {
    const inputElement = document.getElementById(field) as HTMLInputElement;
    if (inputElement) {
      inputElement.value = value;
      console.log(`${field} set to:`, value);
    } else {
      this.speak(`Unable to find the ${field} field.`);
    }
  }

  private handleLoginCommand(command: string): boolean {
    const doc = nlp(command); // Use compromise to process the command
    const normalizedCommand = command.toLowerCase().trim();
  
    // Check for commands related to username or email
    if (
      normalizedCommand.includes('username') ||
      normalizedCommand.includes('email') ||
      normalizedCommand.includes('e-mail')
    ) {
      const extractedUsernameOrEmail = this.extractUsernameOrEmail(doc, command);
      if (extractedUsernameOrEmail) {
        this.setInputValue('username', extractedUsernameOrEmail); // Set the value in the username/email field
        this.speak(`Username or email has been set to ${extractedUsernameOrEmail}.`);
      } else {
        this.speak('Please say your username or email.');
        this.startListeningForInput('username'); // Listen for input if no value is provided
      }
      return true;
    }
  
    // Check for commands related to password
    if (normalizedCommand.includes('password')) {
      const extractedPassword = this.extractPassword(doc, command);
      if (extractedPassword) {
        this.setInputValue('password', extractedPassword); // Set the value in the password field
        this.speak('Password has been set.');
      } else {
        this.speak('Please say your password.');
        this.startListeningForInput('password'); // Listen for input if no value is provided
      }
      return true;
    }
  
    // Check for "Log me in" command
    if (normalizedCommand.includes('log me in') || normalizedCommand.includes('login')) {
      this.speak('Attempting to log you in.');
      this.triggerLogin();
      return true;
    }
  
    return false;
  }
private extractPassword(doc: any, command: string): string | null {
  // Match phrases like "password is", "set password to", "my password is", etc.
  const match = doc.match('(my )?password (is|to) *').text();
  if (match) {
    let extractedPassword = command.replace(match, '').trim();

    // Normalize descriptive words like "uppercase" or "capital"
    extractedPassword = this.normalizeDescriptiveWords(extractedPassword);

    return extractedPassword; // Return the cleaned password
  }

  // Fallback: Use regex to extract a password-like pattern
  const passwordRegex = /(my )?password (is|to)?\s*(.+)/i; // Match "password is 12345" or "my password is 12345"
  const passwordMatch = command.match(passwordRegex);
  if (passwordMatch && passwordMatch[3]) {
    let extractedPassword = passwordMatch[3].trim();

    // Normalize descriptive words like "uppercase" or "capital"
    extractedPassword = this.normalizeDescriptiveWords(extractedPassword);

    return extractedPassword; // Return the cleaned password
  }

  return null; // Return null if no match is found
}

private normalizeDescriptiveWords(input: string): string {
  // List of descriptive words and their corresponding symbols
  const descriptiveWordsMap: { [key: string]: string } = {
    'at': '@',
    'hashtag': '#',
    'dollar': '$',
    'percent': '%',
    'and': '&',
    'star': '*',
    'dot': '.',
    'underscore': '_',
    'dash': '-', // Retain dash only if explicitly mentioned
    'space': ' ',
    '-':'',
  };

  // Replace descriptive words with their corresponding symbols
  Object.keys(descriptiveWordsMap).forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi'); // Match the word as a whole word, case-insensitive
    input = input.replace(regex, descriptiveWordsMap[word]).trim();
  });

  // Remove any standalone dashes that are not explicitly mentioned as "dash"
  input = input.replace(/(?<!\w)-|-(?!\w)/g, ''); // Remove dashes not surrounded by words

  // Handle "uppercase", "capital", "lowercase", and "small" keywords
  const words = input.split(' ');
  for (let i = 0; i < words.length; i++) {
    if (words[i].toLowerCase() === 'uppercase' || words[i].toLowerCase() === 'capital') {
      if (i + 1 < words.length) {
        // Capitalize the next word or part of the word
        words[i + 1] = words[i + 1].charAt(0).toUpperCase() + words[i + 1].slice(1);
      }
      words[i] = ''; // Remove the "uppercase" or "capital" keyword
    } else if (words[i].toLowerCase() === 'lowercase' || words[i].toLowerCase() === 'small') {
      if (i + 1 < words.length) {
        // Convert the next word or part of the word to lowercase
        words[i + 1] = words[i + 1].toLowerCase();
      }
      words[i] = ''; // Remove the "lowercase" or "small" keyword
    }
  }

  // Combine consecutive numbers and handle explicitly mentioned hyphen-separated numbers
  const combinedWords: string[] = [];
  for (let i = 0; i < words.length; i++) {
    if (i > 0 && /^\d+$/.test(words[i]) && /^\d+$/.test(combinedWords[combinedWords.length - 1])) {
      // Combine consecutive numbers
      combinedWords[combinedWords.length - 1] += words[i];
    } else if (i > 0 && words[i] === '-' && /^\d+$/.test(words[i - 1]) && /^\d+$/.test(words[i + 1])) {
      // Combine numbers separated by a hyphen
      combinedWords[combinedWords.length - 1] += words[i + 1];
      i++; // Skip the next word as it has been combined
    } else {
      combinedWords.push(words[i]);
    }
  }

  // Join the words back into a single string
  let normalizedInput = combinedWords.filter(Boolean).join('');

  // Remove trailing period if it exists
  if (normalizedInput.endsWith('.')) {
    normalizedInput = normalizedInput.slice(0, -1);
  }

  return normalizedInput;
}
    private extractUsernameOrEmail(doc: any, command: string): string | null {
      // Define stopwords to remove from the input
      const stopwords = ['set', 'my', 'as', 'is', 'to', 'the', 'a', 'an', 'email', 'e-mail', 'username'];
    
      // Normalize the command by removing stopwords
      let normalizedCommand = command
        .toLowerCase()
        .split(' ')
        .filter((word) => !stopwords.includes(word)) // Remove stopwords
        .join(' ');
    
      console.log('Normalized command:', normalizedCommand);
    
      // Use regex to extract a valid email address
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
      const emailMatch = normalizedCommand.match(emailRegex);
      if (emailMatch) {
        return emailMatch[0]; // Return the valid email address
      }
    
      // Fallback: Extract a username-like pattern
      const usernameRegex = /^[a-zA-Z0-9._-]+$/; // Match valid username patterns
      const usernameMatch = normalizedCommand.match(usernameRegex);
      if (usernameMatch) {
        return usernameMatch[0]; // Return the valid username
      }
    
      return null; // Return null if no match is found
    }
  
  
  private startListeningForInput(field: 'username' | 'password'): void {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Speech recognition is not supported in this browser.');
      return;
    }
  
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
  
    recognition.onresult = (event: any) => {
      let input = event.results[0][0].transcript.trim();
      console.log(`Raw voice input for ${field}:`, input);
  
      // Normalize letters to uppercase if the input is a single letter or spelled out
      input = this.normalizeSpelledInput(input);
      console.log(`Normalized input for ${field}:`, input);
  
      // Set the input value in the respective field
      const inputElement = document.getElementById(field) as HTMLInputElement;
      if (inputElement) {
        inputElement.value = input;
        this.speak(`${field === 'username' ? 'Username' : 'Password'} has been set.`);
      } else {
        this.speak(`Unable to find the ${field} field.`);
      }
    };
  
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      this.speak('An error occurred while capturing your input. Please try again.');
    };
  
    recognition.start();
  }

private normalizeSpelledInput(input: string): string {
  // Split the input into words
  const words = input.split(' ');

  // Map each word to its uppercase equivalent if it's a single letter
  const normalizedWords = words.map((word) => {
    if (word.length === 1 && /^[a-zA-Z]$/.test(word)) {
      return word.toUpperCase(); // Convert single letters to uppercase
    }
    return word; // Leave other words unchanged
  });

  // Join the normalized words back into a string
  return normalizedWords.join('');
}
  
  private triggerLogin(): void {
    // Check if the user is on the login page
    if (this.router.url !== '/login') {
      this.speak('You are not on the login page. Navigating to the login page now.');
      this.router.navigate(['/login']).then(() => {
        this.executeLoginAction(); // Execute login action after navigation
      });
    } else {
      // If already on the login page, execute the login action
      this.executeLoginAction();
    }
  }
  
  private executeLoginAction(): void {
    const usernameInput = document.getElementById('username') as HTMLInputElement;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
  
    if (usernameInput && passwordInput) {
      const username = usernameInput.value;
      const password = passwordInput.value;
  
      if (username && password) {
        console.log('Logging in with:', { username, password });
        this.speak('Logging you in now.');
  
        // Trigger the login action (e.g., submit the form or call a login API)
        const loginButton = document.querySelector('.login-btn') as HTMLButtonElement;
        if (loginButton) {
          if (!loginButton.disabled) {
            // Manually trigger Angular's change detection
            usernameInput.dispatchEvent(new Event('input', { bubbles: true }));
            passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
  
            console.log('Triggering login button click.');
            loginButton.click(); // Simulate a button click
          } else {
            console.error('Login button is disabled.');
            this.speak('The login button is currently disabled. Please check your inputs.');
          }
        } else {
          console.error('Login button not found.');
          this.speak('Login button not found.');
        }
      } else {
        this.speak('Please make sure both username and password are set.');
      }
    } else {
      this.speak('Unable to find the login fields.');
    }
  }

  private handleNavigationCommand(doc: any, command: string): boolean {
    const intents = [
      { keywords: ['home'], route: '/home', message: 'Navigating to home.' },
      { keywords: ['dashboard'], route: '/dashboard', message: 'Navigating to dashboard.' },
      { keywords: ['brokerage'], route: '/brokerage', message: 'Navigating to brokerage.' },
      { keywords: ['register', 'signup'], route: '/register-daf', message: 'Navigating to register.' },
      { keywords: ['login', 'signin'], route: '/login', message: 'Navigating to login.' },
      { keywords: ['make donation', 'add donation', 'donate to charity'], route: '/add-donation', message: 'Navigating to add donation.' },
      { keywords: ['donation'], route: '/view-donation', message: 'Navigating to view donation.' },
      { keywords: ['transfer'], route: '/viewtransfers', message: 'Navigating to view transfers.' },
    ];

    // Check for "go back" or "previous page" commands
    if (command.includes('go back') || command.includes('previous page')) {
      console.log('Navigating to the previous page.');
      this.speak('Going back to the previous page.');
      this.location.back(); // Use Location service to navigate back
      return true;
    }

    for (const intent of intents) {
      if (intent.keywords.some((keyword) => doc.has(keyword))) {
        this.speak(intent.message);
        this.router.navigate([intent.route]);
        return true;
      }
    }
    return false;
  }

  private handleDataQuery(doc: any, command: string): boolean {
    const dataQueries = [
      { keywords: ['daf balance', 'balance', 'my balance'], key: 'dafBalance', message: 'Your DAF balance is' },
      { keywords: ['username', 'my name', 'who am i'], key: 'username', message: 'Your username is' },
      { keywords: ['total donations', 'donations', 'how much have i donated'], key: 'totalDonations', message: 'Your total donations amount to' },
      { keywords: ['charities donated to', 'charities', 'which charities'], key: 'charities', message: 'You have donated to the following charities:' },
      { keywords: ['how many charities', 'number of charities'], key: 'charities', message: 'The number of charities you have donated to is' },
    ];

    for (const query of dataQueries) {
      if (query.keywords.some((keyword) => command.includes(keyword))) {
        const data = this.dataService.getData(query.key);
        console.log(`Fetching data for key: ${query.key}, Data: ${data}`); // Debug log

        if (data) {
          // Handle charities count query
          if (
            query.key === 'charities' &&
            (command.includes('how many') || command.includes('number of'))
          ) {
            if (Array.isArray(data)) {
              const charityCount = data.length; // Get the count of charities
              this.speak(`${query.message} ${charityCount}.`);
            } else {
              this.speak('Sorry, I could not determine the number of charities.');
            }
          }
          // Handle charities list query
          else if (query.key === 'charities' && Array.isArray(data)) {
            const formattedCharities = data
              .map((charity: any) => charity.name) // Extract charity names
              .join(', '); // Join names with commas
            this.speak(`${query.message} ${formattedCharities}.`);
          }
          // Handle other data queries
          else {
            this.speak(`${query.message} ${data}.`);
          }
        } else {
          this.speak('Sorry, I could not find that information.');
        }
        return true;
      }
    }
    return false;
  }

  private speak(message: string): void {
    const speech = new SpeechSynthesisUtterance(message);
    window.speechSynthesis.speak(speech);
  }
}