import { Component, Input, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { AppComponent } from '../../../app.component';
import { AuthData } from '../../../auth/auth.model';
import { APIURLS } from '../../../shared/api-url';
import { AppService } from '../../../shared/app.service';
import { HttpService } from '../../../shared/http-service';
import { Util } from '../../Services/util.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert';
declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-separation-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css'],
  providers: [Util]
})
export class HistoryComponent implements OnInit {
  @Input() employeeId!: number;
  
  currentUser!: AuthData;
  urlPath: string = '';
  isLoading = false;
  itemList: any[] = [];

  statusList = [
    { type: "Submitted", color:"info" },    
    { type: "Pending For Approval", color:"warning"},
    { type: "Approved", color:"success" },    
    { type: "Exit Initiated", color:"warning" },
    { type: "Exit Interview Completed", color:"warning" },
    { type: "Exit Completed", color:"success" },
    { type: "Rejected", color:"danger" },       
    { type: "Email Sent", color:"warning" },
    { type: "Withdrawn", color:"danger" },
    { type: "Rejection Accepted", color:"danger" },
  ]

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,
    private util: Util) { }

  ngOnInit() {
    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
   const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
      
      this.GetData();
    }
  }

  
  GetData() {   

    if(this.employeeId && this.employeeId > 0){
      this.isLoading = true;
      this.httpService.HRget(APIURLS.RESIGNATION_GET_HISTORY_BY_EMP_ID+"/"+ this.employeeId).then((data: any) => {
        if (data) {
          this.itemList = data;       
          for(var item of this.itemList){
            item.statusColor = this.statusList.find(x=>x.type == item.status).color;
          } 
        }
        this.isLoading = false;
      }).catch((error)=> {
        this.isLoading = false;
        //toastr.error("Error occurred while fetching details, please check the link.");
      });
    }
  }

  viewResignation(resignationId: any) {
    let route = 'HR/separation/view-resignation/' + resignationId;    
    this.router.navigateByUrl("/", { skipLocationChange: true }).then(() => {
      this.router.navigate([route]);
    });
  }

}
