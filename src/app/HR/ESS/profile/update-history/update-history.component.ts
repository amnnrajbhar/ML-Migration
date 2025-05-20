import { Component, OnInit, Input } from '@angular/core';
import { APIURLS } from '../../../../shared/api-url';
import { HttpService } from '../../../../shared/http-service';
import { AppService } from '../../../../shared/app.service';
import { AppComponent } from '../../../../app.component';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthData } from '../../../../auth/auth.model';
import { ExcelService } from '../../../../shared/excel-service';
import swal from 'sweetalert';
import { DataStorageService } from '../../../Services/data-storage.service';
declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-update-history',
  templateUrl: './update-history.component.html',
  styleUrls: ['./update-history.component.css']
})
export class UpdateHistoryComponent implements OnInit {

  @Input() employeeId: number;

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,
    private dataStore: DataStorageService, private excelService: ExcelService) { }

  currentUser: AuthData;
  isLoading: boolean = false;
  updateList: any = {};
  
  statusList = [
    { type: "Submitted", color:"info" },    
    { type: "Pending For Approval", color:"warning"},
    { type: "Approved", color:"success" },    
    { type: "Rejected", color:"danger" },    
    { type: "Withdrawn", color:"danger" },    
  ];

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if(this.employeeId > 0)
      this.getData();    
  }

  getData() {
    this.isLoading = true;

    this.httpService.HRgetById(APIURLS.TEMPORARY_EMPLOYEE_GET_HISTORY, this.employeeId).then((data: any) => {
      if (data) {
        this.updateList = data;
        for (var item of data) {
          item.statusColor = this.statusList.find(x => x.type == item.status).color;
        }          
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
    });
  }

}
