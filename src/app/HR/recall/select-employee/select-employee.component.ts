import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from '../../../shared/http-service';
import { APIURLS } from '../../../shared/api-url';
import { AppComponent } from '../../../app.component';
import { AuthData } from '../../../auth/auth.model';
import { Location } from '@angular/common';
declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-select-employee',
  templateUrl: './select-employee.component.html',
  styleUrls: ['./select-employee.component.css']
})
export class SelectEmployeeComponent implements OnInit {
  id: number = 0;
  isLoading: boolean = false;
  recall:any = {};
  currentUser: AuthData;
  constructor(private httpService: HttpService,
    private router: Router,private location:Location) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
  }

  viewEmployeeDetails(employeeId: any) {
    let empId = $('#employeeId').val();
    if(empId > 0){      
      let route = 'HR/recall/recall/' + empId;
      this.router.navigate([route]);
    }
    else
    {
      toastr.error("Select an employee from the list.");
    }
  }
  
  goBack() {
    this.location.back();
  }
  
  lastReportingkeydown = 0;
  getEmployeeName($event) {
    let text = $('#employeeName').val();

    if (text.length >= 2) {
      if ($event.timeStamp - this.lastReportingkeydown > 400) {
        this.httpService.HRget(APIURLS.RECALL_EMPLOYEEMASTER_GET_LIST +"/"+this.currentUser.uid+ "/" + text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a, b) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              if(item.fullName != null)
              return { label: item.fullName + " ("+item.employeeId+")", value: item.id };
            })
            $('#employeeName').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event, ui) {
                if (ui.item) {
                  $("#employeeId").val(ui.item.value);
                  $("#employeeName").val(ui.item.label);
                }
                else{
                  $("#employeeId").val('');
                  $("#employeeName").val('');
                }                  
              },
              select: function (event, ui) {
                if (ui.item) {
                  $("#employeeId").val(ui.item.value);
                  $("#employeeName").val(ui.item.label);
                }
                else{
                  $("#employeeId").val('');
                  $("#employeeName").val('');
                }
                return false;
              }
            });
          }
        });
      }
      this.lastReportingkeydown = $event.timeStamp;
    }
  }

}
