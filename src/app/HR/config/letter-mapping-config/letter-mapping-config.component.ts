
  import { Component, OnInit, ViewChild } from '@angular/core';
  import { NgForm } from '@angular/forms';
  import { HttpService } from '../../../shared/http-service';
  import { APIURLS } from '../../../shared/api-url';
  import { Router, RouterModule } from '@angular/router';
  import { ExcelService } from '../../../shared/excel-service';
  import { AuthData } from '../../../auth/auth.model';
  import { Util } from '../../Services/util.service';
  import { MasterDataService } from '../../Services/masterdata.service';
  import swal from 'sweetalert';
  declare var $: any;
  declare var toastr: any;

@Component({
  selector: 'app-letter-mapping-config',
  templateUrl: './letter-mapping-config.component.html',
  styleUrls: ['./letter-mapping-config.component.css'],
  providers: [Util]

})
export class LetterMappingConfigComponent implements OnInit {


    @ViewChild(NgForm) detailsForm: NgForm;
    isLoading: boolean = false;
    currentUser: AuthData;
    filterModel: any = {};
    filterData: any = {}
    item: any = {};
    count: number = 0;
    isEdit: boolean = false;
    editIndex: number = -1;
    plantList: any[] = [];
    payGroupList: any[] = [];
    filterPayGroupList: any[] = [];
    payGroupFullList: any[] = [];
    appointmentDetails: any = {};
    selectedTemplateId: any;
    Templates:any[] = [];
    
    
    employeeCategoryList: any[] = [];
    departmentList:any[]=[];
    constructor(private httpService: HttpService,
      private router: Router, private util: Util, private masterService: MasterDataService, private excelService: ExcelService) {
       }
  
    ngOnInit() {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.masterService.getPlantList().then((data:any)=>{this.plantList = data;});
      this.masterService.getPayGroupList().then((data:any)=>{this.payGroupFullList = data;});      
      this.masterService.getEmployeeCategoryList().then((data:any)=>{this.employeeCategoryList = data;});
      this.filterModel.pageSize = 10;    
      this.filterModel.plantId = "";
      this.filterModel.payGroupId = "";
      this.filterModel.employeeCategoryId = "";
      this.filterModel.templateName='';
      this.filterModel.createdBy="";
      this.getListData();
      this.getTemplates();
    }
  
    getTemplates(){
      this.httpService.HRget(APIURLS.RESIGNATION_GET_PRINT_TEMPLATES+"/"+"Appointment Letter").then((data: any) => {
        if (data.length > 0) {
          this.Templates = data.sort((a, b) => { if (a.templateName > b.templateName) return 1; if (a.templateName < b.templateName) return -1; return 0; });                   
        }
      }).catch(error => {
        this.Templates = [];
      });
    }
   
    getListData(){    
      this.filterModel.pageNo = 1;
      this.getData();
    }
  
    getData(){
      this.isLoading = true;    
      this.httpService.HRpost(APIURLS.LETTER_MAPPING_CONFIG_GET_BY_FILTER, this.filterModel).then((data: any) => {
        this.filterData = data;      
        this.isLoading = false;
      }).catch(error => {
        toastr.error("Error while fetching the list. Error: "+ error);
        this.isLoading = false;      
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
    
   
    addData(){
      
      toastr.info("Adding...");
      this.isLoading = true;
     
      this.item.createdById = this.currentUser.uid;
      this.item.createdDate = this.util.getFormatedDateTime(new Date());
      this.item.modifiedById = this.currentUser.uid;
      this.item.modifiedDate = this.util.getFormatedDateTime(new Date());
        
      this.httpService.HRpost(APIURLS.LETTER_MAPPING_CONFIG_API, this.item)
      .then((data: any) => {
        if (data == 200 || data.printTemplatePPCMappingId > 0) {
          this.item.printTemplatePPCMappingId  = data.printTemplatePPCMappingId ;
          this.onAddLine();
          toastr.success("Successfully added the details.");        
          $("#detailsModal").modal("hide");
          this.getData();   
        }
        else
        {
          this.isLoading = false;
          toastr.error('Error adding details...'+ data.message);
        }
        this.isLoading = false;
      }).catch(error => {
        this.isLoading = false;
        toastr.error('Error adding details...'+ error);
      })
    }
  
    updateData(){
            
      toastr.info("Updating...");
      this.isLoading = true;     
      this.item.modifiedById = this.currentUser.uid;
      this.item.modifiedDate = this.util.getFormatedDateTime(new Date());
  
      this.httpService.HRpost(APIURLS.LETTER_MAPPING_CONFIG_API_UPDATE, this.item)
      .then((data: any) => {
        if (data == 200 || data.success) {          
          this.onUpdateLine();
          toastr.success("Successfully updated the details.");
          $("#detailsModal").modal("hide");
          this.getData();   
        }
        else
        {
          this.isLoading = false;
          toastr.error('Error updating details...'+ data.message);
        }
        this.isLoading = false;
      }).catch(error => {
        this.isLoading = false;
        toastr.error('Error updating details...'+ error);
      })
    }
  
    deleteData(id, no){
      if(id <= 0) return;
      if(!confirm("Are you sure you want to delete this record?")) return;
  
      toastr.info('Deleting...');
      this.isLoading = true;
      this.httpService.HRdelete(APIURLS.LETTER_MAPPING_CONFIG_API, id)
      .then(
        (data: any) => {
          this.isLoading = false;       
          if (data == 200 || data.success) 
          {   
            toastr.success('Deleted successfully!');
            this.RemoveLine(no);
            this.getData();   
          }
          else
          toastr.error(data.message);
        },
        (err) => {
          this.isLoading = false;
          toastr.error('Error occured while deleting the details. Error:' + err);
        })
        .catch(error => {
          this.isLoading = false;
          toastr.error('Error occured while deleting the details. Error:' + error);
        });
    }
  
    onAddClick(){
      this.clearInput();
      $("#detailsModal").modal("show");
    }
  
    onAddLine(){
      this.filterData.list.push(this.item);
      this.count++;
      this.clearInput();
    }
    
    EditLine(item, index){    
      this.item = Object.assign({}, item);
      this.isEdit = true;
      this.editIndex = index;
      this.onPlantChange();

      $("#detailsModal").modal("show");
    }
  
    onUpdateLine(){    
      this.filterData.list[this.editIndex] = this.item;    
      this.clearInput();
    }
  
    RemoveLine(no){
      if(no == this.editIndex && this.isEdit){
        this.clearInput();
      }else if(no < this.editIndex){
        this.editIndex--;
      }
      this.filterData.list.splice(no,1);
      this.count--;
    }
  
    clearInput(){
      this.isEdit = false;
      this.item = {};
      this.editIndex = -1;    
      this.detailsForm.form.markAsPristine();
      this.detailsForm.form.markAsUntouched();
    }

    exportData() {
      this.filterModel.export = true;
      this.isLoading = true;
      this.httpService.HRpost(APIURLS.LETTER_MAPPING_CONFIG_GET_BY_FILTER, this.filterModel).then((data: any) => {
        this.filterModel.export = false;
        var exportList = [];
        let index = 0;
        data.list.forEach(item => {
          index = index + 1;
          let exportItem = {          
            "Sl No": index,
            "Plant Code":item.plantCode,
            "Plant Name":item.plantName,
            "Pay Group":item.payGroupName,
            "Employee Category":item.employeeCategoryName,
            "Template Name":item.templateName,
            "Created By":item.createdByName,
            "Created On":item.createdDate  ,
            "Modified By":item.modifiedByName,
            "Modified No":item.modifiedDate
          };
          exportList.push(exportItem);
        });
        this.excelService.exportAsExcelFile(exportList, 'SalaryHead_List');
        this.isLoading = false;
      }).catch(error => {
        this.isLoading = false;
        this.filterModel.export = false;
        swal('Error occurred while fetching data.');
        return;
      });
    }

    onPlantChange() {
      if (this.item.plantId > 0) {
        let plant = this.plantList.find(x => x.id == this.item.plantId)
        this.payGroupList = this.payGroupFullList.filter(x => x.plant == plant.code);
      }
      else
        this.payGroupList = [];
    }
  
    onFilterPlantChange() {
      if (this.filterModel.plantId > 0) {
        let plant = this.plantList.find(x => x.id == this.filterModel.plantId)
        this.filterPayGroupList = this.payGroupFullList.filter(x => x.plant == plant.code);       
      }
      else
        this.filterPayGroupList = [];
    }
  }
  