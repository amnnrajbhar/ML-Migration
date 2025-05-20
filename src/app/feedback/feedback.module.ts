import { NgModule } from "@angular/core";
import { LogComplaintComponent } from "./log-complaint/log-complaint.component";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { FeedbackRoutingModule } from "./feedback-routing.module";

@NgModule({
    declarations: [
        LogComplaintComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        FeedbackRoutingModule
    ]
})
export class FeedbackModule{

}