import { Component, Input, OnInit } from '@angular/core';
import { MasterDataService } from '../../Services/masterdata.service';
import { HttpService } from '../../../shared/http-service';
import { APIURLS } from '../../../shared/api-url';
import { AuthData } from '../../../auth/auth.model';
import { AppComponent } from '../../../app.component';
import { AppService } from '../../../shared/app.service';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { NgForm } from '@angular/forms';
declare var $: any;

@Component({
  selector: 'app-activity-viewer',
  templateUrl: './offer-activity.component.html',
  styleUrls: ['./offer-activity.component.css'],
  providers: [MasterDataService]
})
export class OfferActivityComponent implements OnInit {
  @Input() objectId: number;
  @Input() objectType: string;
  currentUser: AuthData;
  isLoading: boolean = false;
  activityList: any[] = [];

  constructor(private masterDataService: MasterDataService, private httpService: HttpService,
    private router: Router) { }

  ngOnInit() {    
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.getActivityList();
    }    
  }
  
  getActivityList() {
    this.isLoading = true;

    this.httpService.HRget(APIURLS.OFFER_GET_ACTIVITIES + "?objectId=" + this.objectId +"&objectType="+this.objectType)
    .then((data: any) => {
      if (data) {
        this.activityList = data;
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.activityList = [];
    });
  }

}
