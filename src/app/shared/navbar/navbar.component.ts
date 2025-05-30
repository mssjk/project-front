import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';
import { VoiceAssistantService } from '../../services/voiceassistant/voice.service';
import nlp from 'compromise'; // Import the compromise NLP library
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [FormsModule,CommonModule,TranslateModule,RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  userName: string = '';
  currentRoute: string = '';
  logoUrl: string = environment.asset + environment.img.logo;
  searchQuery: string = '';
  selectedSearchEngine: string = 'google'; // Default search engine
  recognition: any;

  constructor(
    private router: Router,
    private translate: TranslateService,
    private voiceAssistantService: VoiceAssistantService
  ) {
    this.initializeSpeechRecognition();
    this.translate.setDefaultLang('en-US'); // Set default language
  }

  ngOnInit(): void {
    // Retrieve the username from localStorage
    const storedUserName = localStorage.getItem('userName') || localStorage.getItem('UserName');
    this.userName = storedUserName ? storedUserName : 'Guest';

    // Get the current route
    this.currentRoute = this.router.url;

    // Subscribe to router events to update the current route
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = this.router.url;
      }
    });
  }

  // Initialize the SpeechRecognition API
  private initializeSpeechRecognition(): void {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Speech recognition is not supported in this browser.');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'en-US';
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = (event: any) => {
      const command = event.results[0][0].transcript.toLowerCase();
      console.log('Voice input received:', command);

      // Process the voice input to extract the search engine and query
      this.processVoiceInput(command);
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
    };
  }

  // Process the voice input to extract the search engine and query
  private processVoiceInput(input: string): void {
    const doc = nlp(input);

    // Detect if the query is a question
    const isQuestion = this.detectQuestion(input);
    console.log('Is Question:', isQuestion);

    // Extract keywords for search engines
    const googleKeywords = ['google', 'search on google', 'find on google'];
    const wikipediaKeywords = ['wikipedia', 'search on wikipedia', 'find on wikipedia'];

    // Check if the input contains any Google-related keywords
    if (googleKeywords.some((keyword) => doc.has(keyword))) {
      this.selectedSearchEngine = 'google';
      this.searchQuery = input.replace(/google|search on google|find on google/gi, '').trim();
    }
    // Check if the input contains any Wikipedia-related keywords
    else if (wikipediaKeywords.some((keyword) => doc.has(keyword))) {
      this.selectedSearchEngine = 'wikipedia';
      this.searchQuery = input.replace(/wikipedia|search on wikipedia|find on wikipedia/gi, '').trim();
    }
    // Default to the selected search engine if no keyword is found
    else {
      this.searchQuery = input.trim();
    }

    // Clean up the query using advanced logic
    this.searchQuery = this.cleanQuery(this.searchQuery);

    console.log('Search Engine:', this.selectedSearchEngine);
    console.log('Search Query:', this.searchQuery);

    // Perform the search
    this.performSearch(isQuestion);
  }

  // Detect if the query is a question
  private detectQuestion(input: string): boolean {
    const questionWords = ['what', 'who', 'where', 'why', 'how', 'when'];
    const doc = nlp(input);
    return questionWords.some((word) => doc.has(word));
  }

  // Clean up the query by removing filler words and unnecessary tokens
  private cleanQuery(query: string): string {
    const fillerWords = ['please', 'can you', 'could you', 'would you', 'search for', 'find', 'tell me about'];
    fillerWords.forEach((word) => {
      query = query.replace(new RegExp(`\\b${word}\\b`, 'gi'), '').trim();
    });

    // Remove short words (e.g., "a", "an", "the") and punctuation
    query = query
      .split(' ')
      .filter((word) => word.length > 2)
      .join(' ');

    return query;
  }

  // Perform the search based on the selected search engine
  performSearch(isQuestion: boolean): void {
    if (this.searchQuery.trim()) {
      if (this.selectedSearchEngine === 'google') {
        const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(this.searchQuery)}`;
        window.open(googleUrl, '_blank');
      } else if (this.selectedSearchEngine === 'wikipedia') {
        const wikipediaUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(this.searchQuery)}`;
        window.open(wikipediaUrl, '_blank');
      }

      // Example: Add logic for handling questions
      if (isQuestion) {
        console.log('The query is a question.');
      }
    }
  }

  // Start voice input
  startVoiceInput(): void {
    if (!this.recognition) {
      console.error('Speech recognition is not supported in this browser.');
      return;
    }
    this.recognition.start();
    console.log('Voice input started.');
  }

  // Start the voice assistant
  startVoiceAssistant(): void {
    this.voiceAssistantService.startListening();
  }

  // Logout functionality
  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}