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
  selector: 'app-appraisal-activity',
  templateUrl: './appraisal-activity.component.html',
  styleUrls: ['./appraisal-activity.component.css']
})
export class AppraisalActivityComponent implements OnInit {
  @Input() objectId!: number;
  @Input() objectType: string
  @Input() ctType: string
  currentUser!: AuthData;
  isLoading: boolean = false;
  activityList: any[] = [];

  constructor( private httpService: HttpService,
    private router: Router) { }

  ngOnInit() {
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
   const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
      
     // this.getActivityList();
    }    
  }

  // getActivityList() {
  //   this.isLoading = true;

  //   this.httpService.HRHRget(APIURLS.HR_EMPLOYEE_APPRAISAL_GET_ACTIVITIES + "?objectId=" + this.objectId +"&objectType="+this.objectType)
  //   .then((data: any) => {
  //     if (data) {
  //       this.activityList = data;
  //     }
  //     this.isLoading = false;
  //   }).catch((error)=> {
  //     this.isLoading = false;
  //     this.activityList = [];
  //   });
  // }

}
