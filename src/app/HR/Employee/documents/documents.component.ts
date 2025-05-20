import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../../shared/http-service';
import { APIURLS } from '../../../shared/api-url';
import { Router, RouterModule } from '@angular/router';
import { AuthData } from '../../../auth/auth.model';
import { ExcelService } from '../../../shared/excel-service';
import { Util } from '../../Services/util.service';
import { DomSanitizer } from '@angular/platform-browser'
import swal from 'sweetalert';
import { DataStorageService } from '../../Services/data-storage.service';
declare var $: any;
declare var require: any;

@Component({
  selector: 'app-employee-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css'],
  providers: [Util]
})
export class DocumentsComponent implements OnInit {
  
  currentUser: AuthData;
  isLoading = false;
  from_date: any = null;
    to_date: any = null;
  filterData: any = {};
  filterModel: any ={};
  plantlist: any[] = [];
  payGroupList: any[] = [];
  employeeCategoryList: any[] = [];
  documentTypes = [
    { type: "Offer Letter", color:"warning" },
    { type: "Appointment Letter", color:"success"},
    { type: "Confirmation Letter", color:"success" },
    { type: "Extension Letter", color:"info" },
    { type: "Appraisal Letter", color:"info" },
    { type: "Resignation Acceptance", color:"info" },
    { type: "Relieving Letter", color:"danger" },
    { type: "Service Withdrawn Relieving Letter", color:"danger" },
    { type: "Service Withdrawn Experience Letter", color:"danger" },
    { type: "Service Extension Letter", color:"info" },
    { type: "FNF Settlement", color:"info" }      
  ]

  constructor(private httpService: HttpService,
    private router: Router, private dataStore: DataStorageService, private excelService: ExcelService, 
    private util: Util, private readonly sanitizer: DomSanitizer) { }

  ngOnInit() {
   
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.getPlantList();  
    //this.getPayGroupList();
    this.getEmployeeCategoryList();
    this.getDepartments();
      this.filterModel.pageSize = 10;
      this.filterModel.pageNo = 1;
      this.filterModel.employeeId = this.currentUser.uid;
      this.filterModel.documentType = "";
      this.filterModel.fromDate = "";
      this.filterModel.toDate = "";
      this.filterModel.name = "";
      this.filterModel.departmentId = "";
      this.filterModel.selectedPlantId = "";
      this.filterModel.selectedPayGroupId = "";
     this.filterModel.selectedEmployeeCategoryId = "";
      this.filterModel.documentId="";

    // get filter model from the in memory data store
    var oldFilter = this.dataStore.GetData("DocumentsList");
    if(oldFilter){
      // if the filter was applied earlier use it
      this.filterModel = oldFilter;
    }

      this.getData();
  }

  getPlantList() {
    this.httpService.HRget(APIURLS.OFFER_GET_PLANTS_ASSIGNED + "/" + this.currentUser.uid).then((data: any) => {
      if (data.length > 0) {
        this.plantlist = data.sort((a, b) => { if (a.code > b.code) return 1; if (a.code < b.code) return -1; return 0; });
      }
    }).catch(error => {
      this.plantlist = [];
    });
  }
  
  getPayGroupList() {
    this.payGroupList = [];
      this.filterModel.payGroupId = "";
    if (this.filterModel.selectedPlantId) {
      this.httpService.HRget(APIURLS.OFFER_GET_PAY_GROUPS_ASSIGNED + "/" + this.currentUser.uid + "/" + this.filterModel.selectedPlantId).then((data: any) => {
        if (data.length > 0) {
          this.payGroupList = data.sort((a, b) => { if (a.long_Desc > b.long_Desc) return 1; if (a.long_Desc < b.long_Desc) return -1; return 0; });;
        }
      }).catch(error => {
        this.payGroupList = [];
      });
    }
  }

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

  departmentList: any[] = [];

  getDepartments() {
    this.httpService.HRget(APIURLS.BR_MASTER_DEPARTMENT_API).then((data: any) => {
      if (data.length > 0) {
        this.departmentList = data.sort((a, b) => { if (a.description > b.description) return 1; if (a.description < b.description) return -1; return 0; });
      }
    }).catch(error => {
      this.departmentList = [];
    });
  }
  onFilterClick() {
    
    // if (this.from_date != null)
    //   this.filterModel.fromDate = this.getDateFormate(this.from_date);
    // if (this.to_date != null)
    //   this.filterModel.toDate = this.getDateFormate(this.to_date);
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
    this.httpService.HRpost(APIURLS.HR_EMPLOYEE_GET_DOCUMENTS_BY_FILTER, this.filterModel).then((data: any) => {
      this.filterData = data;
      for(var item of this.filterData.list){
        item.documentTypeColor = this.documentTypes.find(x=>x.type == item.documentType).color;
      }
      // store the filter model
      this.dataStore.SetData("DocumentsList", this.filterModel);
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
    
  viewFile(empId, id, fileName){
    if(id <= 0) return;
    let connection: any;
    this.isLoading = true;
    
    connection = this.httpService.HRdownloadFile(APIURLS.HR_EMPLOYEE_GET_DOCUMENT_FILE+"/"+empId+ "/" + id);

    connection.then((data: any) => {
      // console.log(data);
      // let temp_name = this.visitorsList1.find(s => s.id == id).name;
      // if(data){
      //   var downloadURL = URL.createObjectURL(data);
      //   window.open(downloadURL);
      // }
      
      if (data != undefined) {
        
        if(fileName.toLowerCase().includes(".jpg") || fileName.toLowerCase().includes(".jpeg") || fileName.toLowerCase().includes(".png")){          
          this.showImageInViewer(data);
        }else if(fileName.toLowerCase().includes(".pdf")){          
          this.showPdfInViewer(data);
        }
        else{
          var FileSaver = require('file-saver');
          const imageFile = new File([data], fileName);
          //const imageFile = new File([data], fileName, { type: 'application/doc' });
          // console.log(imageFile);
          FileSaver.saveAs(imageFile);
        }        
      }      
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
    });
  }
  
  downloadFile(empId, id, fileName){
    if(id <= 0) return;
    let connection: any;
    this.isLoading = true;

    connection = this.httpService.HRdownloadFile(APIURLS.HR_EMPLOYEE_GET_DOCUMENT_FILE+"/"+empId+ "/" + id);

    connection.then((data: any) => {
            
      if (data != undefined) {        
          var FileSaver = require('file-saver');
          const imageFile = new File([data], fileName);
          //const imageFile = new File([data], fileName, { type: 'application/doc' });
          // console.log(imageFile);
          FileSaver.saveAs(imageFile);
      }      
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
    });
  }

  imageToShow: any;
showImageInViewer(image: Blob) {  
   let reader = new FileReader();
   reader.addEventListener("load", () => {
      const imageBase64String = reader.result; 
      this.imageToShow = this.sanitizer.bypassSecurityTrustUrl(imageBase64String.toString());
      $("#ImageModal").modal('show');
   }, false);

   if (image) {
      reader.readAsDataURL(image);
   }
}

pdfToShow: any;
showPdfInViewer(file: Blob) {  
  //  let reader = new FileReader();
  //  reader.addEventListener("load", () => {
  //     this.pdfToShow = new Uint8Array(reader.result as ArrayBuffer);
  //     $("#PdfModal").modal('show');
  //  }, false);

  //  if (file) {
  //     reader.readAsArrayBuffer(file);
  //  }

   var blob = new Blob([file], {type: 'application/pdf'});
   var urlCreator = window.URL;   // || window.webkitURL;
   var pdfUrl = urlCreator.createObjectURL(blob);      
   this.pdfToShow = this.sanitizer.bypassSecurityTrustResourceUrl(pdfUrl);
   $("#PdfModal").modal('show');

}

}
