import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../../shared/http-service';
import { APIURLS } from '../../../shared/api-url';
import { Router, RouterModule } from '@angular/router';
import { AuthData } from '../../../auth/auth.model';
import { ExcelService } from '../../../shared/excel-service';
import swal from 'sweetalert';
declare var $: any;


@Component({
  selector: 'app-clearance-checklist',
  templateUrl: './clearance-checklist.component.html',
  styleUrls: ['./clearance-checklist.component.css']
})
export class ClearanceChecklistComponent implements OnInit {
  currentUser!: AuthData;
  plantList: any[] = [];
  payGroupList: any[] = [];
  employeeCategoryList: any[] = [];

  checklistItemId: number = 0;
  comments: string
  action: string
  name: string = "";    
  from_date: any = null;
  to_date: any = null;
  isLoading: boolean = false;

  filterData: any = {};
  filterModel: any ={};
  
selectedStatus: any = null;
statusList = [
  { type: "Pending", color:"warning" },
  { type: "Completed", color:"success"},
  { type: "Not Applicable", color:"info" },    
  { type: "Cancelled", color:"danger" }    
]

  constructor(private httpService: HttpService,
    private router: Router, private excelService: ExcelService) { }

  ngOnInit() {
 const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
    this.filterModel.pageSize = 10;
    this.filterModel.pageNo = 1;
    this.filterModel.SPOCEmployeeId = this.currentUser.uid;
    this.getPlantList();
    this.getEmployeeCategoryList();
    this.getData();
  }
  ngAfterViewInit() {
    this.toggleColumns();
  }

  selectedPlant: any = null;
  getPlantList() {
    this.httpService.HRget(APIURLS.OFFER_GET_PLANTS_ASSIGNED + "/" + this.currentUser.uid).then((data: any) => {
      if (data.length > 0) {
        this.plantList = data.sort((a:any, b:any) => { if (a.code > b.code) return 1; if (a.code < b.code) return -1; return 0; });
      }
    }).catch((error)=> {
      this.plantList = [];
    });
  }

  selectedPayGroup: any = null;
  getPayGroupList() {
    
    if (this.selectedPlant.id > 0) {
      this.httpService.HRget(APIURLS.OFFER_GET_PAY_GROUPS_ASSIGNED + "/" + this.currentUser.uid + "/" + this.selectedPlant.id).then((data: any) => {
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

  selectedEmployeeCategory: any = null;
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

  getChecklistData() {

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

    if (this.name != null && this.name != "")
      this.filterModel.name = this.name;

    this.getData();    
  }

  complete(id){
    this.checklistItemId = id;
    this.comments = "";
    this.action = "Completed";
  }
  
  cancel(id){
    this.checklistItemId = id;
    this.comments = "";
    this.action = "Not Applicable";
  }

  UpdateChecklist() {

    if(this.action == "Not Applicable" && this.comments == ""){
      swal("Please enter comments.");
      return;
    }

    $("#CommentsModal").modal('hide');
    var request:any = {};
    request.checklistItemId = this.checklistItemId;
    request.comments = this.comments;
    request.status = this.action;
    request.modifiedById = this.currentUser.uid;
    swal("Updating...");
    this.httpService.HRpost(APIURLS.CHECKLIST_UPDATE_STATUS, request).then((data: any) => {
      if (data == 200 || data.success) {          
        this.getData();
        swal("Successfully updated.");
      } else if (!data.success) {
        swal(data.message);
      } else
        swal("Error occurred.");
    }).catch((error)=> {
      swal(error);
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

  getData(){
    this.isLoading = true;    
    this.httpService.HRpost(APIURLS.TERMINATION_GET_CHECKLIST_BY_FILTER, this.filterModel).then((data: any) => {
      this.filterData = data;
      for(var item of this.filterData.list){
        item.statusColor = this.statusList.find(x=>x.type == item.status).color;
      }
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

  
  toggleColumns() {
    $(".columnGroup").on("click", function () {
      var group = $(this).attr("data-group");
      if (group == "all") {
        $(".columnGroup").removeClass('active').addClass('active');
        $("#data th, #data td").show();
      }
      else {
        $(this).toggleClass('active');
        $("#data ." + group).toggle();
      }
    });
  }


}
