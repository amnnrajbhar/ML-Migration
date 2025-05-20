import { Component, Input, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { AppComponent } from '../../../app.component';
import { AuthData } from '../../../auth/auth.model';
import { APIURLS } from '../../../shared/api-url';
import { AppService } from '../../../shared/app.service';
import { HttpService } from '../../../shared/http-service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert';
declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-confirmation-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  @Input() employeeId: number;
  
  currentUser: AuthData;
  urlPath: string = '';
  isLoading = false;
  itemList: any[] = [];

  statusList = [
    { type: "Initiated", color: "info" },    
    { type: "Pending For Recommendation", color: "warning" },
    { type: "Recommendation Submitted", color: "warning" },
    { type: "Pending for Approval", color: "warning" },
    { type: "Confirmation Approved", color: "success" },
    { type: "Confirmation Rejected", color: "danger" },
    { type: "Pending for Extension Approval", color: "warning" },
    { type: "Extension Approved", color: "success" },
    { type: "Extension Rejected", color: "danger" },
  ]

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      
      this.GetData();
    }
  }

  
  GetData() {   

    if(this.employeeId && this.employeeId > 0){
      this.isLoading = true;
      this.httpService.HRget(APIURLS.CONFIRMATION_GET_HISTORY_BY_EMP_ID+"/"+ this.employeeId).then((data: any) => {
        if (data) {
          this.itemList = data;       
          for(var item of this.itemList){
            item.statusColor = this.statusList.find(x=>x.type == item.status).color;
          } 
        }
        this.isLoading = false;
      }).catch(error => {
        this.isLoading = false;
        toastr.error("Error occurred while fetching details, please check the link.");
      });
    }
  }

  view(confirmationId: any) {
    let route = 'HR/confirmation/view/' + confirmationId;
    //this.router.navigate([route]);
    
    //let currentUrl = this.router.url;
    this.router.navigateByUrl("/", { skipLocationChange: true }).then(() => {
      //this.router.navigate([currentUrl]);
      this.router.navigate([route]);
    });
  }

}
