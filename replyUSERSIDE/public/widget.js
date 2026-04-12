(function() {
  const config = window.ReplyFlowConfig || {};
  const container = document.createElement('div');
  container.id = 'replyflow-widget-root';
  document.body.appendChild(container);

  // In a real production scenario, this would load the React bundle
  // and mount the ChatWidget component.
  // For this demo, we'll just show a message or redirect to the demo page.
  console.log('ReplyFlow AI Widget loaded for:', config.businessName);
  
  // We could also inject an iframe pointing to our app's /demo route
  const iframe = document.createElement('iframe');
  iframe.src = window.location.origin + '/demo';
  iframe.style.position = 'fixed';
  iframe.style.bottom = '20px';
  iframe.style.right = '20px';
  iframe.style.width = '400px';
  iframe.style.height = '650px';
  iframe.style.border = 'none';
  iframe.style.zIndex = '999999';
  iframe.style.background = 'transparent';
  iframe.allow = 'clipboard-read; clipboard-write';
  
  // document.body.appendChild(iframe);
})();
