import { Injectable } from '@angular/core';
import { DAFService } from '../../services/daf/daf.service';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor(private dafService:DAFService) { }

  getDafDetails(dafId:number): any{
    this.dafService.getDAFAccount(dafId).subscribe({
      next: (response) => {
        console.log('DAF account:', response);
        return response.dafBalance,response.totalDonated;
      },
      error: (err) =>{
        console.error('Error fetching DAF account:', err);
      }
    })
  }
}
