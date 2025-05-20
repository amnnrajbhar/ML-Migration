import { Component, Input, OnInit } from '@angular/core';
import { AppComponent } from '../../../app.component';
import { AuthData } from '../../../auth/auth.model';
import { APIURLS } from '../../../shared/api-url';
import { AppService } from '../../../shared/app.service';
import { HttpService } from '../../../shared/http-service';
//import { Util } from '../Services/util.service';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { NgForm } from '@angular/forms';
declare var $: any;

@Component({
  selector: 'app-appraisal-flow-viewer',
  templateUrl: './appraisal-flow-viewer.component.html',
  styleUrls: ['./appraisal-flow-viewer.component.css']
})
export class AppraisalFlowViewerComponent implements OnInit {

  @Input() objectId: number;
  @Input() objectType: string;

  currentUser: AuthData;
  urlPath: string = '';
  isLoading: boolean = false;
  flows: any[] = [];


  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute) { }

  ngOnInit() {    
    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
     // this.LoadResignationFlowRecords();
    }
  }
    // LoadResignationFlowRecords() {
    //   this.isLoading = true;
  
    //   this.httpService.HRHRget(APIURLS.HR_EMPLOYEE_APPRAISAL_GET_WORKFLOWS + "?objectId=" + this.objectId +"&objectType="+this.objectType).then((data: any) => {
    //     if (data) {
    //       this.flows = data;
    //     }
    //     this.isLoading = false;
    //   }).catch(error => {
    //     this.isLoading = false;
    //     this.flows = [];
    //   });
    // }
  
    toggle(row) {
      
        var expanded = $("#row_"+row).attr("data-expanded");      
        if (expanded == "true") {
          $("#detailRow_" + row).slideUp();
          $("#row_"+row).attr("data-expanded", "false");
        }
        else {
          $("#detailRow_" + row).slideDown();
          $("#row_"+row).attr("data-expanded", "true");
        }
        $("#row_"+row +" i.expander").toggleClass("glyphicon-chevron-down glyphicon-chevron-right");
    }
  
  }
