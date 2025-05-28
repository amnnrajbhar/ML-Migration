import { Component, OnInit } from '@angular/core';
import { APIURLS } from '../../../shared/api-url';
import { HttpService } from '../../../shared/http-service';
import { AppService } from '../../../shared/app.service';
import { AppComponent } from '../../../app.component';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthData } from '../../../auth/auth.model';
import { DataStorageService } from '../../Services/data-storage.service';
import { ExcelService } from '../../../shared/excel-service';

declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-checklist',
  templateUrl: './checklist.component.html',
  styleUrls: ['./checklist.component.css']
})
export class ChecklistComponent implements OnInit {

  constructor(private appService: AppComponent, private httpService: HttpService,private excelService: ExcelService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,private dataStore: DataStorageService) { }

  currentUser!: AuthData;
  isLoading: boolean = false;
  filterData: any = {};
  filterModel: any = {};
  selectedStatus: any = "Pending";
  statusList = [
    { type: "Pending", color:"warning" },
    { type: "Completed", color:"success"},
    { type: "Not Applicable", color:"info" },    
    { type: "Cancelled", color:"danger" }    
  ]
  plantList: any[] = [];
  payGroupList: any[] = [];
  employeeCategoryList: any[] = [];
  departmentList: any[] = [];

  checklistItemId: number = 0;


  ngOnInit() {
 const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;    
    this.getDepartments();
    this.getPlantList();  
    this.getPayGroupList();
    this.getEmployeeCategoryList();
    this.filterModel.pageSize = 10;
    this.filterModel.employeeId = this.currentUser.uid;
    this.filterModel.pageNo = 1;
    this.filterModel.departmentId = null;
    this.filterModel.selectedPlantId = "";
    this.filterModel.selectedPayGroupId = "";
    this.filterModel.selectedEmployeeCategoryId = "";
    this.filterModel.selectedDepartmentId = null;
    this.filterModel.EmployeeName="";
    this.filterModel.Title="";
    this.filterModel.SPOCEmployeeName="";
    this.filterModel.selectedStatus="Pending";
        
        var oldFilter = this.dataStore.GetData("CheckList");
        if(oldFilter){
          this.filterModel = oldFilter;
        }
    this.getData();
  }

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
    if (this.filterModel.selectedPlantId > 0) {
      this.httpService.HRget(APIURLS.OFFER_GET_PAY_GROUPS_ASSIGNED + "/" + this.currentUser.uid + "/" + this.filterModel.selectedPlantId).then((data: any) => {
        if (data.length > 0) {
          this.payGroupList = data.sort((a:any, b:any) => { if (a.long_Desc > b.long_Desc) return 1; if (a.long_Desc < b.long_Desc) return -1; return 0; });;
          
          // this.getPrintTemplates();
        }
      }).catch((error)=> {
        this.payGroupList = [];
      });
    }
    else
      this.payGroupList = [];
  }
  getEmployeeCategoryList() {
    this.httpService.HRget(APIURLS.OFFER_GET_EMP_CATEGORIES_ASSIGNED + "/" + this.currentUser.uid + "/0/0" )
    .then((data: any) => {
      if (data.length > 0) {
        this.employeeCategoryList = data.sort((a:any, b:any) => { if (a.catltxt > b.catltxt) return 1; if (a.catltxt < b.catltxt) return -1; return 0; });;
      }
    }).catch((error)=> {
      this.employeeCategoryList = [];
    });
  } 
  
  getDepartments() {
    this.httpService.HRget(APIURLS.BR_MASTER_DEPARTMENT_API).then((data: any) => {
      if (data.length > 0) {
        this.departmentList = data.sort((a:any, b:any) => { if (a.description > b.description) return 1; if (a.description < b.description) return -1; return 0; });
      }
    }).catch((error)=> {
      this.departmentList = [];
    });
  }

  gotoPage(no) {
    if (this.filterModel.pageNo == no) return;
    this.filterModel.pageNo = no;
    this.getData();
  }

  pageSizeChange() {
    this.filterModel.pageNo = 1;
    this.getData();
  }

  getCheckList ()
  {
    this.getData();
  }
  getData() {
    this.isLoading = true;
    this.httpService.HRpost(APIURLS.RESIGNATION_GET_CHECKLIST, this.filterModel).then((data: any) => {
      this.filterData = data;
      for (var item of this.filterData.list) {
        item.statusColor = this.statusList.find((x:any)  => x.type == item.status).color;
      }

      this.dataStore.SetData("CheckList", this.filterModel);
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
    });
  }

  detailList: any[] = [];
  exportData(){
    this.filterModel.export = true;
    this.isLoading = true;    
    this.httpService.HRpost(APIURLS.RESIGNATION_GET_CHECKLIST, this.filterModel).then((data: any) => {
      this.detailList = data.list;     
      this.filterModel.export = false;
      var exportList=[];
      let index=0;
      this.detailList.forEach((item :any) => {
        index=index+1;
        let exportItem={
          "Checklist ID": item.checklistItemId,
          "Status": item.status,
          "Type": item.objectType,
          "Id": item.objectId,
          "Title": item.title,
          "Department": item.checklistDepartmentName,
          "SPOC Employee Name":item.spocEmployeeFirstName +' '+item.spocEmployeeMiddleName+' '+item.spocEmployeeLastName,
          "Employee Name":item.firstName + ' '+ item.middleName +' '+item.lastName,
          "Relieving Date": this.setDateFormate(item.relievingDate),
          "Plant Name": item.plantName,
          "Paygroup Name": item.payGroupName,
          "Category Name": item.employeeCategoryName,
          "Department Name": item.departmentName,  
          "Designation": item.designationName,                   
          "Role": item.roleName,
                                          
        };
          exportList.push(exportItem);
      });
      this.excelService.exportAsExcelFile(exportList, 'Check_List'); 
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;   
      this.filterModel.export = false;
      toastr.error('Error occurred while fetching data.');   
      return;
    });    
  }

  
  setDateFormate(date: any): string {
    let d1 = new Date(date);
    return ("00" + d1.getDate()).slice(-2) + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      d1.getFullYear() +' ' +
      ("00" + d1.getHours()).slice(-2) + ":" +
      ("00" + d1.getMinutes()).slice(-2) + ":" +
      ("00" + d1.getSeconds()).slice(-2);
  }
}
