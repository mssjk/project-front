// import { Injectable } from '@angular/core';
// import * as dialogflow from '@google-cloud/dialogflow';
// import { v4 as uuidv4 } from 'uuid';

// @Injectable({
//   providedIn: 'root',
// })
// export class DialogflowService {
//   private sessionClient: any;
//   private sessionId: string;

//   constructor() {
//     // Initialize the Dialogflow session client with the service account key
//     this.sessionClient = new dialogflow.SessionsClient({
//       keyFilename: 'src/assets/dialogflow-key.json', // Path to your service account key
//     });
//     this.sessionId = uuidv4(); // Generate a unique session ID
//   }

//   async detectIntent(query: string): Promise<string> {
//     const sessionPath = this.sessionClient.projectAgentSessionPath(
//       'voiceassistant-huup', // Replace with your Google Cloud project ID
//       this.sessionId
//     );

//     const request = {
//       session: sessionPath,
//       queryInput: {
//         text: {
//           text: query,
//           languageCode: 'en-US',
//         },
//       },
//     };

//     const responses = await this.sessionClient.detectIntent(request);
//     const result = responses[0].queryResult;
//     console.log('Detected intent:', result.intent.displayName);
//     console.log('Fulfillment text:', result.fulfillmentText);

//     return result.fulfillmentText;
//   }
// }