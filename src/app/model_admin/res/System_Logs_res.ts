export interface SystemLogsRes {
    success: boolean;
    data:    Data;
}

export interface Data {
    logs:       Log[];
    pagination: Pagination;
}

export interface Log {
    log_id:      number;
    user_id:     number;
    first_name:  FirstName;
    last_name:   LastName;
    msu_mail:    MsuMail;
    role:        Role;
    action:      Action;
    target_type: TargetType;
    target_id:   string;
    detail:      Detail | null;
    ip_address:  IPAddress;
    user_agent:  string;
    created_at:  Date;
}

export enum Action {
    LoginFailed = "login_failed",
    LoginPasswordVerified = "login_password_verified",
    LoginSuccess = "login_success",
    OtpFailed = "otp_failed",
}

export interface Detail {
    reason: string;
}

export enum FirstName {
    Admin = "admin",
    Super = "Super",
}

export enum IPAddress {
    Ffff1721901 = "::ffff:172.19.0.1",
    The200144C86610B4C24Be5Ddc67FD3B9 = "2001:44c8:6610:b4c:24be:5ddc:67f:d3b9",
    The2022835213 = "202.28.35.213",
    The4923741125 = "49.237.41.125",
}

export enum LastName {
    Admin = "Admin",
    System = "system",
}

export enum MsuMail {
    Lukashirinh13GmailCOM = "lukashirinh13@gmail.com",
    Lukashirinh14GmailCOM = "lukashirinh14@gmail.com",
}

export enum Role {
    Admin = "Admin",
    SuperAdmin = "SuperAdmin",
}

export enum TargetType {
    Otp = "otp",
    User = "user",
}

export interface Pagination {
    total:      number;
    page:       number;
    limit:      number;
    totalPages: number;
}
