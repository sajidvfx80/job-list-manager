import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportJobsToPDF = (jobs, clientName = null, date = null) => {
  const doc = new jsPDF();
  
  // Title
  let title = 'Job List Report';
  if (clientName) {
    title = `${clientName} - Job List`;
  }
  if (date) {
    title += ` - ${new Date(date).toLocaleDateString()}`;
  }
  
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  
  // Prepare table data
  const tableData = jobs.map(job => {
    const jobTypeValue = job.job_type || job.jobType;
    const jobTypes = Array.isArray(jobTypeValue) 
      ? jobTypeValue 
      : (jobTypeValue ? (typeof jobTypeValue === 'string' && jobTypeValue.includes(',') 
          ? jobTypeValue.split(',').map(t => t.trim()) 
          : [jobTypeValue]) 
        : []);
    const jobTypeDisplay = jobTypes.length > 0 ? jobTypes.join(', ') : 'N/A';
    const jobName = job.job_name || job.jobName || 'N/A';
    const assignedTo = job.assigned_to || job.assignedTo;
    const deliveryDate = job.delivery_date || job.deliveryDate;
    const completionStatus = job.completion_status || job.completionStatus;
    
    return [
      job.client || 'N/A',
      jobName,
      jobTypeDisplay,
      job.category || 'N/A',
      assignedTo || 'N/A',
      new Date(deliveryDate).toLocaleDateString(),
      job.status || 'Pending',
      completionStatus || '-'
    ];
  });

  // Add table
  doc.autoTable({
    startY: 30,
    head: [['Client', 'Job Name', 'Job Type', 'Category', 'Assigned To', 'Delivery Date', 'Status', 'Completion']],
    body: tableData,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [66, 139, 202] },
  });

  // Add LED deliverables if any
  const ledJobs = jobs.filter(job => {
    const jobTypeValue = job.job_type || job.jobType;
    const jobTypes = Array.isArray(jobTypeValue) 
      ? jobTypeValue 
      : (jobTypeValue ? (typeof jobTypeValue === 'string' && jobTypeValue.includes(',') 
          ? jobTypeValue.split(',').map(t => t.trim()) 
          : [jobTypeValue]) 
        : []);
    const ledDeliverables = job.led_deliverables || job.ledDeliverables;
    return jobTypes.includes('LED') && ledDeliverables && ledDeliverables.length > 0;
  });
  
  if (ledJobs.length > 0) {
    let yPos = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.text('LED Deliverables Details', 14, yPos);
    
    ledJobs.forEach((job, index) => {
      const deliveryDate = job.delivery_date || job.deliveryDate;
      const ledDeliverables = job.led_deliverables || job.ledDeliverables;
      
      yPos += 10;
      doc.setFontSize(10);
      doc.text(`${job.client} - ${new Date(deliveryDate).toLocaleDateString()}:`, 14, yPos);
      yPos += 6;
      doc.setFontSize(9);
      ledDeliverables.forEach(deliverable => {
        doc.text(`  • ${deliverable}`, 20, yPos);
        yPos += 5;
      });
    });
  }

  // Generate filename
  let filename = 'job-list';
  if (clientName) {
    filename = `${clientName.toLowerCase().replace(/\s+/g, '-')}-jobs`;
  }
  if (date) {
    filename += `-${new Date(date).toISOString().split('T')[0]}`;
  }
  filename += '.pdf';

  doc.save(filename);
};

