import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../../shared/http-service';
import { APIURLS } from '../../../shared/api-url';
import { Router, RouterModule } from '@angular/router';
import { ExcelService } from '../../../shared/excel-service';
import { AuthData } from '../../../auth/auth.model';
import { RetirementListReportFilter } from '../../retirement/retirement-list-report/RetirementListReportFilter.model';
import swal from 'sweetalert';
import { DataStorageService } from '../../Services/data-storage.service';
import { MasterDataService } from '../../Services/masterdata.service';
declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-recall-list-report',
  templateUrl: './recall-list-report.component.html',
  styleUrls: ['./recall-list-report.component.css'],
  providers:[MasterDataService]
})
export class RecallListReportComponent implements OnInit {
  id: number = 0;
  action: string
  isLoading: boolean = false;
  plantList: any[] = [];
  payGroupList: any[] = [];
  employeeCategoryList: any[] = [];
  departmentList: any[] = [];
  locationList: any[] = [];
  locationFullList: any[] = [];
  stateList: any[] = [];
  filterData: any = {};
  currentUser!: AuthData;
  recallId: number = 0;
  comments: string
  reisinationList1: any[] = [];
  genderList: any[] = [
    { id: 1, name: 'Any' },
    { id: 2, name: 'Female' },
    { id: 2, name: 'Male' },
  ];
  typeList: any[] = [
    { id: 1, name: 'Recall' },
    { id: 2, name: 'Service Withdrawal' },
  ];
  optionList: any[] = [
    { id: 1, name: 'Going To Retire' },
    { id: 2, name: 'Retired' },
    { id: 3, name: 'Service Extended' },
  ];

  filterModel: RetirementListReportFilter = {} as RetirementListReportFilter;
  constructor(private httpService: HttpService,private masterService: MasterDataService,
    private router: Router, private excelService: ExcelService, private dataStore: DataStorageService) {
      currentUser: AuthData;
     }

  ngOnInit() {
 const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
    this.filterModel.pageSize = 10;
    this.filterModel.selectedDepartmentId = "";
    this.filterModel.pageNo = 1;
    this.filterModel.employeeId = this.currentUser.uid;
    this.filterModel.name = "";
    this.filterModel.selectedPlantId = "";
    this.filterModel.selectedPayGroupId = "";
    this.filterModel.selectedEmployeeCategoryId = "";
    this.filterModel.selectedFromdate = "";
    this.filterModel.selectedTodate = "";    
    

    this.getData();
    this.masterService.getPlantList().then((data:any)=>{this.plantList = data;});
    this.masterService.getPayGroupList().then((data:any)=>{this.payGroupList = data;});
    this.masterService.getDepartments().then((data:any)=>{this.departmentList = data;});
    this.masterService.getDesignation().then((data:any)=>{this.designationList = data;});
    this.masterService.getState().then((data:any)=>{this.stateList = data;});
    this.masterService.getLocation().then((data:any)=>{this.locationFullList = data;});
    this.getEmployeeCategoryList();
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
  
      getLocationList(){
      this.filterModel.selectedLocationId = "";
      if(this.filterModel.selectedStateId > 0)
        this.locationList = this.locationFullList.filter((x:any)=>x.stateID == this.filterModel.selectedStateId);
      else 
        this.locationList = [];    
    }

    onStateChanged() {
     var selectedState = this.stateList.find(x=>x.id == this.filterModel.selectedStateId);
    if(selectedState)
      this.locationList = this.locationFullList.filter((x:any)  => x.stateId == selectedState.bland);
  }

  designationList: any[] = [];
  getDesignation() {
    this.httpService.HRget(APIURLS.BR_DESIGNATION_HR_API).then((data: any) => {
      if (data.length > 0) {
        this.designationList = data.sort((a:any, b:any) => { if (a.name > b.name) return 1; if (a.name < b.name) return -1; return 0; });
      }
    }).catch((error)=> {
      this.designationList = [];
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
  getRecallList() {
    this.filterModel.pageNo = 1;    
       
    this.getData();     
  }

  getData(){
    this.isLoading = true;    
    this.httpService.HRpost(APIURLS.RECALL_LIST_REPORT, this.filterModel).then((data: any) => {
      this.filterData = data;

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
    if(date == null || date == undefined || date == "") return "";
    let d1 = new Date(date);
    return ("00" + d1.getDate()).slice(-2) + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      d1.getFullYear();
  }


  recallList1: any[] = [];
  exportData(){
    this.filterModel.export = true;
    this.isLoading = true;    
    this.httpService.HRpost(APIURLS.RECALL_LIST_REPORT, this.filterModel).then((data: any) => {
      this.recallList1 = data.list;     
      this.filterModel.export = false;
      var exportList=[];
      let index=0;
      this.recallList1.forEach((item :any) => {
        index=index+1;
                                                                                                

        let exportItem={
          "Sl No":index,
          "Employee No.": item.employeeNo,
          "Employee Name": item.fullName,
          "Designation": item.designation,
          "Role": item.role,
          "Department": item.department,
          "Sub Department": item.subDepartmentName,
          "Reporting Group": item.reportingGroupName,          
          "Plant Name": item.plantName,
          "Paygroup Name": item.payGroupName,
          "Reporting Manager": item.reportingManagerName,
          "HOD": item.approvingManagerName,             
          "Location": item.location,                    
          "Grade": item.grade,
          "Roll": item.role,
          "Date Of Birth": this.setDateFormate(item.dateOfBirth),
          "Age": item.age,          
          "Date Of Recall": this.setDateFormate(item.dateOfRecall), 
          "Current CTC" : item.currentCTC,
          "Monthly Gross" : item.monthlyGross,
                                           
        };
          exportList.push(exportItem);
      });
      this.excelService.exportAsExcelFile(exportList, 'Recall_List'); 
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;   
      this.filterModel.export = false;
      toastr.error('Error occurred while fetching data.');   
      return;
    });    
  }
  }
