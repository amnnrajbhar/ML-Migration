
import { APIURLS } from '../../shared/api-url';
import { HttpService } from '../../shared/http-service';
import { Injectable } from '@angular/core';


@Injectable()
export class MasterDataService {
  
  constructor(private httpService: HttpService) { }
  
  getPlantList(): any {
    var plantList: any[] = [];
    return this.httpService.HRget(APIURLS.OFFER_PLANT_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        plantList = data.sort((a:any, b:any) => { if (a.code > b.code) return 1; if (a.code < b.code) return -1; return 0; });
      }
      return plantList;
    }).catch((error)=> {
        return plantList;
    });    
  }
  
  getPlantListAssigned(eid: number): any {
    var plantList: any[] = [];
    return this.httpService.HRget(APIURLS.OFFER_GET_PLANTS_ASSIGNED + "/" + eid).then((data: any) => {
      if (data.length > 0) {
        plantList = data.sort((a:any, b:any) => { if (a.code > b.code) return 1; if (a.code < b.code) return -1; return 0; });
      }
      return plantList;
    }).catch((error)=> {
        return plantList;
    });    
  }

  getPayGroupList(): any {
    var payGroupList: any[] = [];
    return this.httpService.HRget(APIURLS.OFFER_PAYGROUP_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        payGroupList =  data.sort((a:any, b:any) => { if (a.long_Desc > b.long_Desc) return 1; if (a.long_Desc < b.long_Desc) return -1; return 0; });;
      }
      return payGroupList;
    }).catch((error)=> {
      return payGroupList;
    });    
  }  
  
  getPayGroupListAssigned(eid: number, plantId: any): any {
    var payGroupList: any[] = [];
    return this.httpService.HRget(APIURLS.OFFER_GET_PAY_GROUPS_ASSIGNED+ "/" + eid + "/" + plantId).then((data: any) => {
      if (data.length > 0) {
        payGroupList =  data.sort((a:any, b:any) => { if (a.long_Desc > b.long_Desc) return 1; if (a.long_Desc < b.long_Desc) return -1; return 0; });;
      }
      return payGroupList;
    }).catch((error)=> {
      return payGroupList;
    });    
  }  

  getEmployeeCategoryList(): any {
    var employeeCategoryList: any[] = [];
    return this.httpService.HRget(APIURLS.OFFER_EMPLOYEE_CATEGORY_ALL_API).then((data: any) => {
      if (data.length > 0) {
        employeeCategoryList = data.sort((a:any, b:any) => { if (a.catltxt > b.catltxt) return 1; if (a.catltxt < b.catltxt) return -1; return 0; });;
      }
      return employeeCategoryList;
    }).catch((error)=> {
      return employeeCategoryList;
    });    
  }

  getEmployeeCategoryListAssigned(eid: number, plantId: any, payGroupId: any): any {
    var employeeCategoryList: any[] = [];
    return this.httpService.HRget(APIURLS.OFFER_GET_EMP_CATEGORIES_ASSIGNED+ "/" + eid + "/" + plantId + "/" + payGroupId).then((data: any) => {
      if (data.length > 0) {
        employeeCategoryList = data.sort((a:any, b:any) => { if (a.catltxt > b.catltxt) return 1; if (a.catltxt < b.catltxt) return -1; return 0; });;
      }
      return employeeCategoryList;
    }).catch((error)=> {
      return employeeCategoryList;
    });    
  }

  getLocation(): any {
    var locationList: any[] = [];
    return this.httpService.HRget(APIURLS.OFFER_LOCATION_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        locationList = data.sort((a:any, b:any) => { if (a.name > b.name) return 1; if (a.name < b.name) return -1; return 0; });
      }
      return locationList;
    }).catch((error)=> {
      return locationList;
    });    
  }  
  
  getCountries(): any {      
    let list: [] = [];
    return this.httpService.HRget(APIURLS.APPOINTMENT_GET_COUNTRIES).then((data: any) => {
      if (data.length > 0) {
        list = data.sort((a:any, b:any) => { if (a.landx > b.landx) return 1; if (a.landx < b.landx) return -1; return 0; });
      }
      return list;
    }).catch((error)=> {
      return list;
    });
    return list;
  }

  getState(): any {
    var stateList: any[] = [];
    return this.httpService.HRget(APIURLS.OFFER_STATE_GET_BY_COUNTRY + "/IN").then((data: any) => {
      if (data.length > 0) {
        stateList = data.sort((a:any, b:any) => { if (a.bezei > b.bezei) return 1; if (a.bezei < b.bezei) return -1; return 0; });
      }
      return stateList;
    }).catch((error)=> {
      return stateList;
    });    
  }  

  
  getStateAll(): any {
    var stateList: any[] = [];
    return this.httpService.HRget(APIURLS.OFFER_STATE_API+"/GetAll").then((data: any) => {
      if (data.length > 0) {
        stateList = data.sort((a:any, b:any) => { if (a.bezei > b.bezei) return 1; if (a.bezei < b.bezei) return -1; return 0; });
      }
      return stateList;
    }).catch((error)=> {
      return stateList;
    });    
  }  

  getDesignation(): any {
    var designationList: any[] = [];
    return this.httpService.HRget(APIURLS.BR_DESIGNATION_HR_API).then((data: any) => {
      if (data.length > 0) {
        designationList = data.sort((a:any, b:any) => { if (a.name > b.name) return 1; if (a.name < b.name) return -1; return 0; });
      }
      return designationList;
    }).catch((error)=> {
      return designationList;
    });    
  }  

  getRole(): any {
    var roleList: any[] = [];
    return this.httpService.HRget(APIURLS.OFFER_ROLE_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        roleList = data.sort((a:any, b:any) => { if (a.role_ltxt > b.role_ltxt) return 1; if (a.role_ltxt < b.role_ltxt) return -1; return 0; });
      }
      return roleList;
    }).catch((error)=> {
      return roleList;
    });
    
  }  

  getGrade(): any {
    var gradeList: any[] = [];
    return this.httpService.HRget(APIURLS.OFFER_GRADE_ALL_API).then((data: any) => {
      if (data.length > 0) {
        gradeList = data.sort((a:any,b:any)=>{if(a.GRDTXT > b.GRDTXT) return 1; if(a.GRDTXT < b.GRDTXT) return -1; return 0;});
      }
      return gradeList;
    }).catch((error)=> {
      return gradeList;
    });    
  }
  
  getDepartments(): any{
    var departmentList:any[]=[];
    return this.httpService.HRget(APIURLS.BR_MASTER_DEPARTMENT_API).then((data: any) => {
      if (data.length > 0) {
        departmentList = data.sort((a:any, b:any) => { if (a.description > b.description) return 1; if (a.description < b.description) return -1; return 0; });
      }
      return departmentList;
    }).catch((error)=> {
      return departmentList;
    });
  }  

  getSubDepartments(): any{
    var subDepartmentList:any[]=[];
    return this.httpService.HRget(APIURLS.APPOINTMENT_GET_SUB_DEPARTMENTS).then((data: any) => {
      if (data.length > 0) {
        subDepartmentList = data.sort((a:any, b:any) => { if (a.sdptidLtxt > b.sdptidLtxt) return 1; if (a.sdptidLtxt < b.sdptidLtxt) return -1; return 0; });
      }
      return subDepartmentList;
    }).catch((error)=> {
      return subDepartmentList;
    });
  }  
  
  getQualifications(): any{
    var qualificationList: any[] = [];
    return this.httpService.HRget(APIURLS.EDUCATION_C_M_API_GETALL).then((data: any) => {
      if (data.length > 0) {
        qualificationList = data.sort((a:any, b:any) => { if (a.educationCourse > b.educationCourse) return 1; if (a.educationCourse < b.educationCourse) return -1; return 0; });
      }
      return qualificationList;
    }).catch((error)=> {
      return qualificationList;
    });
  }  

  getReportingGroups(): any{
    var reportingGroupsList: any[] = [];
    return this.httpService.HRget(APIURLS.APPOINTMENT_GET_REPORTING_GROUPS).then((data: any) => {
      if (data.length > 0) {
        reportingGroupsList = data.sort((a:any, b:any) => { if (a.reportingGroupLt > b.reportingGroupLt) return 1; if (a.reportingGroupLt < b.reportingGroupLt) return -1; return 0; });
      }
      return reportingGroupsList;
    }).catch((error)=> {
      return reportingGroupsList;
    });
  }

  getSalaryHeads(): any{
    var salaryHeadList: any[] = [];
    return this.httpService.HRget(APIURLS.BR_GET_SALARY_HEAD_LIST_ALL).then((data: any) => {
      if (data.length > 0) {
        salaryHeadList = data.sort((a:any, b:any) => { if (a.salaryLT > b.salaryLT) return 1; if (a.salaryLT < b.salaryLT) return -1; return 0; });
      }
      return salaryHeadList;
    }).catch((error)=> {
      return salaryHeadList;
    });
  }

}
