import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../../shared/http-service';
import { APIURLS } from '../../../shared/api-url';
import { Router, RouterModule } from '@angular/router';
import { ExcelService } from '../../../shared/excel-service';
import { AuthData } from '../../../auth/auth.model';

declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-confirm-transfer-joining',
  templateUrl: './confirm-transfer-joining.component.html',
  styleUrls: ['./confirm-transfer-joining.component.css']
})
export class ConfirmTransferJoiningComponent implements OnInit {

  id: number = 0;
  action: string;
  isLoading: boolean = false;
  transferId: any;
  plantList: any[] = [];
  payGroupList: any[] = [];
  employeeCategoryList: any[] = [];
  filterData: any = {};
  currentUser: AuthData;
  from_date: any = null;
  to_date: any = null;
  oneMonthFromNow: Date;
  name:string="";
  comments: string;
  joiningDate:Date;
  transferList: any[] = [];
  departmentList: any[] = [];  
  selectedStatus: any = null;
  statusList = [
    { type: "Submitted", color:"info" },    
    { type: "Pending For Approval", color:"warning"},
    { type: "Approved", color:"success" },    
    { type: "Rejected", color:"danger" },    
    { type: "Withdrawn", color:"danger" },    
  ]
  filterModel: any = {};

  constructor(private httpService: HttpService,
    private router: Router, private excelService: ExcelService) {
      currentUser: AuthData;
     }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.filterModel.pageSize = 10;
    this.getTransferList();
    this.getPlantList();
    this.getEmployeeCategoryList();
  }

 
  selectedPlant: any = null;
  getPlantList() {
    this.httpService.HRget(APIURLS.OFFER_GET_PLANTS_ASSIGNED + "/" + this.currentUser.uid).then((data: any) => {
      if (data.length > 0) {
        this.plantList = data.sort((a, b) => { if (a.code > b.code) return 1; if (a.code < b.code) return -1; return 0; });
      }
    }).catch(error => {
      this.plantList = [];
    });
  }

  selectedPayGroup: any = null;
  getPayGroupList() {
    
    if (this.selectedPlant.id > 0) {
      this.httpService.HRget(APIURLS.OFFER_GET_PAY_GROUPS_ASSIGNED + "/" + this.currentUser.uid + "/" + this.selectedPlant.id).then((data: any) => {
        if (data.length > 0) {
          this.payGroupList = data.sort((a, b) => { if (a.long_Desc > b.long_Desc) return 1; if (a.long_Desc < b.long_Desc) return -1; return 0; });;
        }
      }).catch(error => {
        this.payGroupList = [];
      });
    }
    else{
      this.payGroupList = [];
      this.selectedPayGroup = null;
    }
  }

  selectedEmployeeCategory: any = null;
  getEmployeeCategoryList() {
    this.httpService.HRget(APIURLS.OFFER_GET_EMP_CATEGORIES_ASSIGNED + "/" + this.currentUser.uid + "/0/0")
      .then((data: any) => {
        if (data.length > 0) {
          this.employeeCategoryList = data.sort((a, b) => { if (a.catltxt > b.catltxt) return 1; if (a.catltxt < b.catltxt) return -1; return 0; });;
        }
      }).catch(error => {
        this.employeeCategoryList = [];
      });
  }

  gotoPage(no){
    if( this.filterModel.pageNo == no) return;
    this.filterModel.pageNo = no;
    this.getData();    
  }

  pageSizeChange(){
    this.filterModel.pageNo = 1;    
    this.getData();    
  }
  
  getTransferList() {
    this.filterModel.pageNo = 1;
    this.filterModel.employeeId = this.currentUser.uid;
    this.filterModel.selectedPlantId = null;
    this.filterModel.selectedPayGroupId = null;
    this.filterModel.selectedEmployeeCategoryId = null;
    this.filterModel.selectedFromdate ="";
    this.filterModel.selectedTodate = "";
    this.filterModel.selectedStatus = null;
    this.filterModel.onlyApprovedTransfers = true;

    if (this.selectedPlant != null) {
      this.filterModel.selectedPlantId = this.selectedPlant.id;
    }
    if (this.selectedEmployeeCategory != null) {
      this.filterModel.selectedEmployeeCategoryId = this.selectedEmployeeCategory.id;
    }
    if (this.selectedPayGroup != null) {
      this.filterModel.selectedPayGroupId = this.selectedPayGroup.id;
    }
    if (this.selectedStatus != null) {
      this.filterModel.selectedStatus = this.selectedStatus.type;
    }
    if (this.from_date != null)
      this.filterModel.selectedFromdate = this.getDateFormate(this.from_date);
    if (this.to_date != null)
      this.filterModel.selectedTodate = this.getDateFormate(this.to_date);

    this.getData();   
  
  }

  getData(){
    this.isLoading = true;    
    this.httpService.HRpost(APIURLS.HR_TRANSFER_LIST_BY_FILTER, this.filterModel).then((data: any) => {
      this.filterData = data;
      for(var item of this.filterData.list){
        item.statusColor = this.statusList.find(x=>x.type == item.status).color;
      }
      
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;      
    });
  }

  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);
  }

  setDateFormate(date: any): string {
    let d1 = new Date(date);
    return ("00" + d1.getDate()).slice(-2) + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      d1.getFullYear();
  }

  viewRetirement(id: any) {
    let route = 'HR/transfer/view/' + id;
    this.router.navigate([route]);
  }  

  exportData(){
    this.filterModel.export = true;
    this.isLoading = true;    
    this.httpService.HRpost(APIURLS.HR_TRANSFER_LIST_BY_FILTER, this.filterModel).then((data: any) => {
      this.filterModel.export = false;
      var exportList=[];
      let index=0;
      data.list.forEach(item => {
        index=index+1;
        let exportItem={
          "Sl No":index,
          "ID":item.employeeTransferId,
          "Employee ID": item.employeeId,
          "Employee No": item.employeeNo,
          "Employee Name": item.fullName,
          "Status": item.status,
          "Transfer Date": this.setDateFormate(item.effectiveDate),
          "Created Date": this.setDateFormate(item.createdDate),
          "Created By": item.createdByName,
          "Plant Name": item.plantName,
          "Paygroup Name": item.payGroupName,
          "Category Name": item.employeeCategoryName,
          "Location": item.location,                    
          "Grade": item.grade,
          "Role": item.role,
          "Reporting Manager": item.reportingManagerName,            
          "HOD": item.approvingManagerName,     
                                            
        };
          exportList.push(exportItem);
      });
      this.excelService.exportAsExcelFile(exportList, 'Retirement_List'); 
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;   
      this.filterModel.export = false;
      toastr.error('Error occurred while fetching data.');   
      return;
    });    
  }

  view(transferId: any) {
    let route = 'HR/transfer/view/' + transferId;
    this.router.navigate([route]);
  }


  confirmjoining(id) {
    this.transferId = id;
    this.comments = "";
    this.action = "ConfirmJoining";
  }

  performTask() {
    if (this.comments==undefined || this.comments=='')
    {
      toastr.error("Enter Comments");
      return;
    }
    var confirmMsg = this.action == "ConfirmJoining" ? "Are you sure you want to Confirm Joining?"
      : "Are you sure you want to archive this?";

    $("#CommentsModal").modal('hide');
    if (confirm(confirmMsg)) {
      var request: any = {};
      request.id = this.transferId;
      request.comments = this.comments;
      request.joiningDate = this.joiningDate;
      //request.status = this.action;
      request.modifiedById = this.currentUser.uid;
      toastr.info("Updating...");
      this.httpService.HRpost(APIURLS.HR_TRANSFER_CONFIRM_JOINING, request).then((data: any) => {
        if (data == 200 || data.success) {
          this.getTransferList();
          toastr.success("Successfully " + this.action);
        } else if (!data.success) {
          toastr.error(data.message);
        } else
        toastr.error("Error occurred.");
      }).catch(error => {
        toastr.error(error);
      });
    }
  }

}

