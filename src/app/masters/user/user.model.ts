

export class User {
    constructor(
        public uid: number,
        public roleId: number,
        public roleName: string,
        public departmentName: string,
        public ProfileName: string,
        public departmentId: number,
        public profileId: number,
        public usr_level: number,
        public usr_id: string,
        public cmpid: number,
        public usr_name: string,
        public usr_f_name: string,
        public usr_l_name: string,
        public usr_pwd: string,
        public reusr_pwd:string,
        public usr_div: string,
        public usr_desig: string,
        public usr_email: string,
        public usr_phone: string,
        public usr_enid: number,
        public usr_divid: number,
        public usr_approve_status: boolean,
        public usr_create_by: string,
        public usr_update_by: string,
        public usr_status: boolean,
        
    ) { }
}
