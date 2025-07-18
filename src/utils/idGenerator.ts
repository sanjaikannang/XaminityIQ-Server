export async function generateFacultyId(): Promise<string> {
    const lastFaculty = await this.facultyRepository.findLastFaculty();
    let nextNumber = 1;

    if (lastFaculty && lastFaculty.facultyId) {
        const lastNumber = parseInt(lastFaculty.facultyId.replace('FAC', ''));
        nextNumber = lastNumber + 1;
    }

    return `FAC${nextNumber.toString().padStart(3, '0')}`;
}


export async function generateStudentId(): Promise<string> {
    const lastStudent = await this.studentRepository.findLastStudent();
    let nextNumber = 1;

    if (lastStudent && lastStudent.studentId) {
        const lastNumber = parseInt(lastStudent.studentId.replace('STU', ''));
        nextNumber = lastNumber + 1;
    }

    return `STU${nextNumber.toString().padStart(3, '0')}`;
}