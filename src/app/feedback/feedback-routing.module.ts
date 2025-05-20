import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { LogComplaintComponent } from "./log-complaint/log-complaint.component";
import { ResolveComplaintComponent } from "./resolve-complaint/resolve-complaint.component";
import { AuthGuard } from "../auth/auth-guard.service";

const feedbackRoutes: Routes  = [
    { path: '', component: LogComplaintComponent, canActivate: [AuthGuard] }
];

@NgModule({
    imports: [RouterModule.forChild(feedbackRoutes)],
    exports: [RouterModule]
})

export class FeedbackRoutingModule{}