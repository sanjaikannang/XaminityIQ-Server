import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AdminRepositoryService } from "./admin-repository/admin.repository";
import { UserRepositoryService } from "./user-repository/user.repository";


// Schemas
import { Admin, AdminSchema } from "src/schemas/admin.schema";
import { User, UserSchema } from "src/schemas/user.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Admin.name, schema: AdminSchema },
            { name: User.name, schema: UserSchema },
        ]),
    ],
    controllers: [],
    providers: [
        AdminRepositoryService,        
        UserRepositoryService,
    ],
    exports: [
        AdminRepositoryService,        
        UserRepositoryService,
    ],
})
export class RepositoryModule { }