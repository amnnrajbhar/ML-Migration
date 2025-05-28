import { Component, OnInit } from '@angular/core';
import { CompleteRecallTaskRequest } from './CompleteRecallTaskRequest.model';
import { AuthData } from '../../../auth/auth.model';
import { HttpService } from '../../../shared/http-service';
import { APIURLS } from '../../../shared/api-url';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { RecallListFilter } from '../recall-list/recalllistfilter.model';
import { ExcelService } from '../../../shared/excel-service';
import { DataStorageService } from '../../Services/data-storage.service';
declare var $: any;
import swal from 'sweetalert';

@Component({
  selector: 'app-pending-recall',
  templateUrl: './pending-recall.component.html',
  styleUrls: ['./pending-recall.component.css']
})
export class PendingRecallComponent implements OnInit {
  currentUser: AuthData;
  urlPath: string = '';
  myTasks: any[] = [];
  isLoading: boolean = false;
  selectedType: any = "";
  selectedPlant: any= "";
  selectedPayGroup: any= "";
  selectedEmpCategory: any= "";
  taskId: number = 0;
  comments: string;
  types = [{type:"Recall Approval"}];
  plantList: any[] = [];
  payGroupList: any[] = [];
  empCategoryList: any[] = [];
  errorCount =0;
  filterModel: RecallListFilter = {} as RecallListFilter;
  filterRecall: any = {};
  constructor(private httpService: HttpService, private router: Router, private route: ActivatedRoute,
    private excelService: ExcelService, private dataStore: DataStorageService) { }

  ngOnInit() {
    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    this.filterModel.pageSize = 10;
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));     
      this.LoadDropDowns();
      this.LoadMyPendingTasks();
    }
  }

LoadDropDowns(){
  this.getPlantList();
  this.getPayGroupList();
  this.getEmployeeCategoryList();
}

getPlantList() {
  this.httpService.HRget(APIURLS.OFFER_PLANT_MASTER_ALL_API).then((data: any) => {
    if (data.length > 0) {
      this.plantList = data.filter(x=> x.isActive).sort((a,b)=>{if(a.code > b.code) return 1; if(a.code < b.code) return -1; return 0;});
    }
  }).catch(error => {
    this.plantList = [];
  });
}
gotoPage(no){
  if( this.filterModel.pageNo == no) return;
  this.filterModel.pageNo = no;
  this.LoadMyPendingTasks();    
}
pageSizeChange(){
  this.filterModel.pageNo = 1;    
  this.LoadMyPendingTasks();    
}
getPayGroupList() {
  this.httpService.HRget(APIURLS.OFFER_PAYGROUP_MASTER_ALL_API).then((data: any) => {
    if (data.length > 0) {
      this.payGroupList = data.sort((a,b)=>{if(a.long_Desc > b.long_Desc) return 1; if(a.long_Desc < b.long_Desc) return -1; return 0;});
    }
  }).catch(error => {
    this.payGroupList = [];
  });
}

getEmployeeCategoryList() {
  this.httpService.HRget(APIURLS.OFFER_EMPLOYEE_CATEGORY_ALL_API).then((data: any) => {
    if (data.length > 0) {
      this.empCategoryList = data.sort((a,b)=>{if(a.catltxt > b.catltxt) return 1; if(a.catltxt < b.catltxt) return -1; return 0;});
    }
  }).catch(error => {
    this.empCategoryList = [];
  });
}

  LoadMyPendingTasks() {
    this.isLoading = true;
    let userId = this.currentUser.uid;
    
    this.httpService.HRget(APIURLS.RECALL_PENDING_TASKS+"?userId="+ userId
    +"&plantId="+(this.selectedPlant?this.selectedPlant:"")
    +"&payGroupId="+(this.selectedPayGroup?this.selectedPayGroup:"")
    +"&empCategoryId="+(this.selectedEmpCategory?this.selectedEmpCategory:"")
    +"&type="+(this.selectedType?this.selectedType:""))
    .then((data: any) => {
      if (data) {        
          this.myTasks = data;
        //this.myTasks.reverse();
      }
      //this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.myTasks = [];
    });
  }

  dateDiff(startingDate, endingDate) {
    let startDate = new Date(new Date(startingDate).toISOString().substr(0, 10));
    if (!endingDate) {
      endingDate = new Date().toISOString().substr(0, 10); // need date in YYYY-MM-DD format
    }
    let endDate = new Date(endingDate);
    if (startDate > endDate) {
      const swap = startDate;
      startDate = endDate;
      endDate = swap;
    }
    const startYear = startDate.getFullYear();
    const february = (startYear % 4 === 0 && startYear % 100 !== 0) || startYear % 400 === 0 ? 29 : 28;
    const daysInMonth = [31, february, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  
    let yearDiff = endDate.getFullYear() - startYear;
    let monthDiff = endDate.getMonth() - startDate.getMonth();
    if (monthDiff < 0) {
      yearDiff--;
      monthDiff += 12;
    }
    let dayDiff = endDate.getDate() - startDate.getDate();
    if (dayDiff < 0) {
      if (monthDiff > 0) {
        monthDiff--;
      } else {
        yearDiff--;
        monthDiff = 11;
      }
      dayDiff += daysInMonth[startDate.getMonth()];
    }
  
    return yearDiff + ' Years ' + monthDiff + ' Months ' + dayDiff + ' Days ';
  }
  filterData(){
    this.LoadMyPendingTasks();
  }

  approveBulk(){
    var selectedList = this.myTasks.filter(x => x.selected);
    if(selectedList.length <= 0)
    {
      swal("Please select at least one task to approve.");
      return;
    }
    this.errorCount = 0;
    swal("Approving...");
    for(var t of selectedList)
    {      
      var request = {} as CompleteRecallTaskRequest;
      request.flowTaskId = t.flowTaskId;
      request.completedById = this.currentUser.uid;
      
      this.httpService.HRpost(APIURLS.RECALL_APPROVE_TASK, request).then((data: any) => {
        if (data) {
          if(!data.success){
            this.errorCount++;
          }
        }
      }).catch(error => {
        this.errorCount++;
      });
    }

    setTimeout(() => 
    {
      if(this.errorCount <= 0)
        swal("Approval Successful.");
      else 
        swal("Approval failed for " + this.errorCount + " tasks.");
      this.LoadMyPendingTasks();
    }, 5000);
    
  }

 

  approve(id){
    this.taskId = id;
    if(confirm("Are you sure you want to approve this?"))
    {
      var request = {} as CompleteRecallTaskRequest;
      request.flowTaskId = id;
      request.completedById = this.currentUser.uid;
      swal("Approving...");
      this.httpService.HRpost(APIURLS.RECALL_APPROVE_TASK, request).then((data: any) => {
        if (data) {
          if(!data.success){
            swal(data.message);
          }else{
            swal("Recall Approved successfully.");
            this.myTasks = null;
            this.LoadMyPendingTasks();
          }
        }
      }).catch(error => {
        swal("Error occured.");
      });
    }
  }

  reject(id){
    this.taskId = id;
    this.comments = "";
  }
  
  rejectTask(){
    if (this.comments==undefined || this.comments=='')
    {
      swal("Enter Reason For Rejection");
      return;
    }
    $("#CommentsModal").modal('hide');
    
    var request = {} as CompleteRecallTaskRequest;
    request.flowTaskId = this.taskId;
    request.comments = this.comments;
    request.completedById = this.currentUser.uid;
    swal("Rejecting...");
    this.httpService.HRpost(APIURLS.RECALL_REJECT_TASK, request).then((data: any) => {
      if (data) {
        if(!data.success){
          swal(data.message);
        }
        else{
          swal("Recall Rejected successfully.");
          this.myTasks = null;
          this.LoadMyPendingTasks();
        }
      }
    }).catch(error => {
      swal(error);
    });
  }
  exportData(){
    // this.filterModel.export = true;
    this.isLoading = true;    
   
      var exportList=[];
      let index=0;
      this.myTasks.forEach(item => {
        index=index+1;
        let exportItem={
          "Sl No": index,
          "ID": item.objectId,
            "Type":item.name,
            "Submitted On":item.startDate,
            "Submitted By":item.initiatedBy,
            "Approval":item.role,
            "Approver":item.approvers.join('; '),
            "Employee No":item.employeeNo,            
            "Name":item.fullName,
            "Plant":item.plant,
            "Plant Code":item.plantCode,
            "Pay Group":item.payGroup,
            "Employee Category":item.employeeCategory,
            "Location":item.location,
            "Role":item.jobRole,
            "Designation":item.designation,
            "Joining Date":item.dateOfJoining,
            "Tenure":item.tenure,          
            "Notice Period":item.noticePeriod,                   
            "Recall Date":item.recallDate,
            "Reason":item.reason,
        };
          exportList.push(exportItem);
      });
      this.excelService.exportAsExcelFile(exportList, 'Pending_Recalls'); 
      this.isLoading = false;
  
  }
  }


