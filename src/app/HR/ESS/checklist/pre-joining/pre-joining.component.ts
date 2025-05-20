import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../../../shared/http-service';
import { APIURLS } from '../../../../shared/api-url';
import { Router, RouterModule } from '@angular/router';
import { AuthData } from '../../../../auth/auth.model';
import { ExcelService } from '../../../../shared/excel-service';
import swal from 'sweetalert';
import { DataStorageService } from '../../../Services/data-storage.service';
declare var $: any;

@Component({
  selector: 'app-pre-joining',
  templateUrl: './pre-joining.component.html',
  styleUrls: ['./pre-joining.component.css']
})
export class PreJoiningComponent implements OnInit {

  constructor(private httpService: HttpService,
    private router: Router, private excelService: ExcelService, private dataStore: DataStorageService) { }

    currentUser: AuthData;
    plantList: any[] = [];
    payGroupList: any[] = [];
    employeeCategoryList: any[] = [];

    checklistItemId: number = 0;
    comments: string;
    action: string;
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

    ngOnInit() {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.filterModel.pageSize = 10;
      this.filterModel.pageNo = 1;
      this.filterModel.SPOCEmployeeId = this.currentUser.uid;
      this.getPlantList();
      this.getEmployeeCategoryList();

      this.filterModel.selectedPlantId = "";
      this.filterModel.selectedPayGroupId = "";
      this.filterModel.selectedEmployeeCategoryId = "";
      this.filterModel.selectedStatus = "";
      this.filterModel.selectedFromdate = "";
      this.filterModel.selectedTodate = "";
      this.filterModel.name = "";

      // get filter model from the in memory data store
      var oldFilter = this.dataStore.GetData("PrejoiningCheckList");
      if(oldFilter){
        // if the filter was applied earlier use it
        this.filterModel = oldFilter;
      }
      this.getData();
    }
  
  ngAfterViewInit() {
    this.toggleColumns();
  }

  getPlantList() {
    this.httpService.HRget(APIURLS.RESIGNATION_GET_PLANTS_ASSIGNED + "/" + this.currentUser.uid).then((data: any) => {
      if (data.length > 0) {
        this.plantList = data.sort((a, b) => { if (a.code > b.code) return 1; if (a.code < b.code) return -1; return 0; });
      }
    }).catch(error => {
      this.plantList = [];
    });
  }

  getPayGroupList() {
    this.filterModel.selectedPayGroupId = null;
    this.filterModel.selectedEmployeeCategoryId = null;
    
    if (this.filterModel.selectedPlantId > 0) {
      this.httpService.HRget(APIURLS.OFFER_GET_PAY_GROUPS_ASSIGNED + "/" + this.currentUser.uid + "/" + this.filterModel.selectedPlantId).then((data: any) => {
        if (data.length > 0) {
          this.payGroupList = data.sort((a, b) => { if (a.long_Desc > b.long_Desc) return 1; if (a.long_Desc < b.long_Desc) return -1; return 0; });;
        }
      }).catch(error => {
        this.payGroupList = [];
      });
    }
    else
      this.payGroupList = [];
  }

  getEmployeeCategoryList() {
    this.filterModel.selectedEmployeeCategoryId = null;

    this.httpService.HRget(APIURLS.OFFER_GET_EMP_CATEGORIES_ASSIGNED + "/" + this.currentUser.uid + "/0/0")
      .then((data: any) => {
        if (data.length > 0) {
          this.employeeCategoryList = data.sort((a, b) => { if (a.catltxt > b.catltxt) return 1; if (a.catltxt < b.catltxt) return -1; return 0; });;
        }
      }).catch(error => {
        this.employeeCategoryList = [];
      });
  } 

  getChecklistData() {
    this.filterModel.pageNo = 1;
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

  offerId: number=0;
  Open(id){
    this.offerId=id;
    $("#UpdateModal").modal('show');
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
    }).catch(error => {
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
    this.httpService.HRpost(APIURLS.CHECKLIST_GET_CHECKLIST_BY_FILTER, this.filterModel).then((data: any) => {
      this.filterData = data;
      for(var item of this.filterData.list){
        item.statusColor = this.statusList.find(x=>x.type == item.status).color;
      }
      // store the filter model
      this.dataStore.SetData("PrejoiningCheckList", this.filterModel);
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
