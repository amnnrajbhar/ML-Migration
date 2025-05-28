import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../../shared/http-service';
import { APIURLS } from '../../../shared/api-url';
import { Router, RouterModule } from '@angular/router';
import { ExcelService } from '../../../shared/excel-service';
import { AuthData } from '../../../auth/auth.model';
import { ResignationListFilter } from '../../separation/resignation-list/ResignationListFilter.model';
import swal from 'sweetalert';
import { DataStorageService } from '../../Services/data-storage.service';
declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-payment-list',
  templateUrl: './payment-list.component.html',
  styleUrls: ['./payment-list.component.css']
})
export class PaymentListComponent implements OnInit {
  id: number = 0;
  action: string
  isLoading: boolean = false;
  plantList: any[] = [];
  payGroupList: any[] = [];
  employeeCategoryList: any[] = [];
  departmentList: any[] = [];
  filterData: any = {};
  currentUser!: AuthData;
  resignationId: number = 0;
  comments: string
  reisinationList1: any[] = [];

  filterModel: ResignationListFilter = {} as ResignationListFilter;
  constructor(private httpService: HttpService,
    private router: Router, private excelService: ExcelService, private dataStore: DataStorageService) {
      currentUser: AuthData;
     }

  ngOnInit() {
 const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
    this.filterModel.pageSize = 10;
    this.filterModel.selectedStatus = this.statusList.find(x=>x.type=="Pending For Approval").type;
    this.filterModel.departmentId = "";
    this.filterModel.pageNo = 1;
    this.filterModel.employeeId = this.currentUser.uid;
    this.filterModel.name = "";
    this.filterModel.selectedPlantId = "";
    this.filterModel.selectedPayGroupId = "";
    this.filterModel.selectedEmployeeCategoryId = "";
    this.filterModel.selectedFromdate = "";
    this.filterModel.selectedTodate = "";    
    
    // get filter model from the in memory data store
    var oldFilter = this.dataStore.GetData("ResignationPaymentList");
    if(oldFilter){
      // if the filter was applied earlier use it
      this.filterModel = oldFilter;
    }
    this.getData();
    this.getPlantList();
    this.getDepartments();
    this.getEmployeeCategoryList();
  }

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
  getPlantList() {
    this.httpService.HRget(APIURLS.RESIGNATION_GET_PLANTS_ASSIGNED + "/" + this.currentUser.uid).then((data: any) => {
      if (data.length > 0) {
        this.plantList = data.sort((a:any, b:any) => { if (a.code > b.code) return 1; if (a.code < b.code) return -1; return 0; });
      }
    }).catch((error)=> {
      this.plantList = [];
    });
  }

  getPayGroupList() {
    this.filterModel.selectedPayGroupId = null;
    this.filterModel.selectedEmployeeCategoryId = null;
    
    if (this.filterModel.selectedPlantId > 0) {
      this.httpService.HRget(APIURLS.OFFER_GET_PAY_GROUPS_ASSIGNED + "/" + this.currentUser.uid + "/" + this.filterModel.selectedPlantId).then((data: any) => {
        if (data.length > 0) {
          this.payGroupList = data.sort((a:any, b:any) => { if (a.long_Desc > b.long_Desc) return 1; if (a.long_Desc < b.long_Desc) return -1; return 0; });;
        }
      }).catch((error)=> {
        this.payGroupList = [];
      });
    }
    else
      this.payGroupList = [];
  }

  getEmployeeCategoryList() {
    this.httpService.HRget(APIURLS.OFFER_GET_EMP_CATEGORIES_ASSIGNED + "/" + this.currentUser.uid + "/0/0")
      .then((data: any) => {
        if (data.length > 0) {
          this.employeeCategoryList = data.sort((a:any, b:any) => { if (a.catltxt > b.catltxt) return 1; if (a.catltxt < b.catltxt) return -1; return 0; });;
        }
      }).catch((error)=> {
        this.employeeCategoryList = [];
      });
  }


  getDepartments(){
    this.httpService.HRget(APIURLS.BR_MASTER_DEPARTMENT_API).then((data: any) => {
      if (data.length > 0) {
        this.departmentList = data.sort((a:any, b:any) => { if (a.description > b.description) return 1; if (a.description < b.description) return -1; return 0; });
      }
    }).catch((error)=> {
      this.departmentList = [];
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

  resigList: any[] = [];
  getResignationList() {
    this.filterModel.pageNo = 1;    
    this.getData();     
  }

  getData(){
    this.isLoading = true;    
    this.httpService.HRpost(APIURLS.RESIGNATION_PAYMENT_LIST_BY_FILTER, this.filterModel).then((data: any) => {
      this.filterData = data;
      for(var item of this.filterData.list){
        item.statusColor = this.statusList.find(x=>x.type == item.status).color;
      }
      // store the filter model
      this.dataStore.SetData("ResignationPaymentList", this.filterModel);
      this.isLoading = false;
    }).catch((error)=> {
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
      d1.getFullYear() +' ' +
      ("00" + d1.getHours()).slice(-2) + ":" +
      ("00" + d1.getMinutes()).slice(-2) + ":" +
      ("00" + d1.getSeconds()).slice(-2);
  }


  viewResignation(resignationId: any) {
    let route = 'HR/separation/view-resignation/' + resignationId;
    this.router.navigate([route]);
  }

  
  addPayment(resignationId: any,employeeId: any) {
    let route = 'HR/separation/add-payment/' + resignationId +"/" + employeeId;
    this.router.navigate([route]);
  }

  resignationList1: any[] = [];
  exportData(){
    this.filterModel.export = true;
    this.isLoading = true;    
    this.httpService.HRpost(APIURLS.RESIGNATION_LIST_BY_FILTER, this.filterModel).then((data: any) => {
      this.resignationList1 = data.list;     
      this.filterModel.export = false;
      var exportList=[];
      let index=0;
      this.resignationList1.forEach((item :any) => {
        index=index+1;
        let exportItem={
          "Sl No":index,
          "Resignation ID": item.resignationId,
          "Status": item.status,
          "Created Date": this.setDateFormate(item.createdDate),
          "Created By": item.createdByName,
          "Employee No": item.employeeNo,
          "Employee Name": item.fullName,
          "Plant Name": item.plantName,
          "Paygroup Name": item.payGroupName,
          "Category Name": item.categoryName,
          "Location": item.location,                    
          "Grade": item.grade,
          "Roll": item.role,
          "Date Of Joining": this.setDateFormate(item.dateOfJoining),  
          "Resignation Date": this.setDateFormate(item.resignationDate),
          "Last Working Date": this.setDateFormate(item.lastWorkingDate),
          "Reason": item.reason,     
          "Reporting Manager": item.reportingManagerName,            
          "HOD": item.approvingManagerName,  
          "Shortfall Days": item.shortfallDays,  
          "Settlement Type": item.settlementType,  
          "Payment Mode": item.payMode,  
          "Payment Amount": item.payAmount,     
                                            
        };
          exportList.push(exportItem);
      });
      this.excelService.exportAsExcelFile(exportList, 'Resignation_List'); 
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;   
      this.filterModel.export = false;
      toastr.error('Error occurred while fetching data.');   
      return;
    });    
  }

  submitForApproval(id:any) {
    if (confirm("Are you sure you want to submit this for approval?")) {
      var request: any = {};
      request.resignationId = id;
      request.submittedById = this.currentUser.uid;
      toastr.info("Submitting...");
      this.httpService.HRpost(APIURLS.RESIGNATION_SUBMIT_FOR_APPROVAL, request)
        .then((data: any) => {
          if (data == 200 || data.success) {
            this.reisinationList1= null;
            this.getResignationList();
            toastr.success("Successfully submitted for approval.");
          } else if (!data.success) {
            toastr.error(data.message);
          } else
          toastr.error("Error occurred.");
        }).catch((error)=> {
          toastr.error(error);
        });
    }
  }

  }
