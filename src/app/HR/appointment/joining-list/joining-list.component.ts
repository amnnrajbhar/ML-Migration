import { Component, OnInit } from '@angular/core';
import { MasterDataService } from '../../Services/masterdata.service';
import { HttpService } from '../../../shared/http-service';
import { APIURLS } from '../../../shared/api-url';
import { OfferListFilter } from '../../Offer/offer-list/offerlistfilter.model';
import { Router, RouterModule } from '@angular/router';
import { OfferUpdateRequest } from '../../Offer/offer-list/offerupdaterequest.model';
import { AuthData } from '../../../auth/auth.model';
import swal from 'sweetalert';
import { DataStorageService } from '../../Services/data-storage.service';
declare var $: any;

@Component({
  selector: 'app-joining-list',
  templateUrl: './joining-list.component.html',
  styleUrls: ['./joining-list.component.css']
})
export class JoiningListComponent implements OnInit {
  currentUser!: AuthData;
  plantList: any[] = [];
  payGroupList: any[] = [];
  employeeCategoryList: any[] = [];
  isLoading: boolean = false;
  filterData: any = {};
  filterModel: OfferListFilter = {} as OfferListFilter;

  constructor(private httpService: HttpService, private router: Router, private dataStore: DataStorageService) { }

  ngOnInit() {
 const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null; 
    this.filterModel.pageSize = 10;
    this.filterModel.pageNo = 1;
    this.filterModel.selectedStatus = "Details Submitted";
    this.filterModel.selectedPlantId = "";
    this.filterModel.selectedPayGroupId = "";
    this.filterModel.selectedEmployeeCategoryId = "";
    this.filterModel.selectedFromdate = "";
    this.filterModel.selectedTodate = "";
    this.filterModel.name = "";
    this.getPlantList();    
    this.getEmployeeCategoryList();
    
    // get filter model from the in memory data store
    var oldFilter = this.dataStore.GetData("JoiningList");
    if(oldFilter){
      // if the filter was applied earlier use it
      this.filterModel = oldFilter;
    }

    this.filterModel.employeeId = this.currentUser.uid;
    this.getData();   
  }
  
  ngAfterViewInit() {
    this.toggleColumns();
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
  
  getPlantList() {
    this.httpService.HRget(APIURLS.OFFER_GET_PLANTS_ASSIGNED + "/" + this.currentUser.uid).then((data: any) => {
      if (data.length > 0) {
        this.plantList = data.sort((a:any, b:any) => { if (a.code > b.code) return 1; if (a.code < b.code) return -1; return 0; });
      }
    }).catch((error)=> {
      this.plantList = [];
    });
  }

  getPayGroupList() {
    
    if (this.filterModel.selectedPlantId) {
      this.httpService.HRget(APIURLS.OFFER_GET_PAY_GROUPS_ASSIGNED + "/" + this.currentUser.uid + "/" + this.filterModel.selectedPlantId).then((data: any) => {
        if (data.length > 0) {
          this.payGroupList = data.sort((a:any, b:any) => { if (a.long_Desc > b.long_Desc) return 1; if (a.long_Desc < b.long_Desc) return -1; return 0; });;
        }
      }).catch((error)=> {
        this.payGroupList = [];
      });
    }
    else{
      this.payGroupList = [];
      this.filterModel.selectedPayGroupId = "";
      this.filterModel.selectedEmployeeCategoryId = "";
    }
  }

  getEmployeeCategoryList() {    
    if (this.employeeCategoryList.length <= 0) {
      this.httpService.HRget(APIURLS.OFFER_EMPLOYEE_CATEGORY_ALL_API)
        .then((data: any) => {
          if (data.length > 0) {
            this.employeeCategoryList = data.sort((a:any, b:any) => { if (a.catltxt > b.catltxt) return 1; if (a.catltxt < b.catltxt) return -1; return 0; });;
          }
        }).catch((error)=> {
          this.employeeCategoryList = [];
        });
    }
  }

  offerList1: any[] = [];
  getOfferList() {
    this.filterModel.pageNo = 1;
    this.getData();    
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
    this.httpService.HRpost(APIURLS.APPOINTMENT_GET_LIST_BY_FILTER, this.filterModel).then((data: any) => {
      this.filterData = data;     
      // store the filter model
      this.dataStore.SetData("JoiningList", this.filterModel);
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;      
    });
  }

  confirmJoining(id: any){
    let route = 'HR/appointment/confirm-joining/' + id;
    this.router.navigate([route]);
  }
  
  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);
  }


}
