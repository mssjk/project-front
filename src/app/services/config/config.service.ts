import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  constructor() { }

  getApi(): string {
    return environment.apiUrl;
  }
  getauthEnd():string{
    return environment.endpoints.users;
  }
  getbrokeEnd():string{
    return environment.endpoints.brokerage;
  }
  getdafEnd():string{
    return environment.endpoints.daf;
  }
  getcharityEnd():string{
    return environment.endpoints.charities;
  }
  getdonatEnd():string{
    return environment.endpoints.donations
  }

  getLogo():string{
    return environment.asset+environment.img.logo;
  }
  getDonateImg():string{
    return environment.asset+environment.img.donate;
  }
}
