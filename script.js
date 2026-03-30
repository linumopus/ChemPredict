document.addEventListener('DOMContentLoaded', () => {
    // ---- TAB SWITCHING LOGIC ----
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to the clicked button
            button.classList.add('active');

            // Show the corresponding section
            const targetId = button.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // ---- PERIODIC TABLE LOGIC ----
    const ptGrid = document.getElementById('pt-grid');
    const detailName = document.getElementById('detail-name');
    const detailSymbol = document.getElementById('detail-symbol');
    const detailNumber = document.getElementById('detail-number');
    const detailMass = document.getElementById('detail-mass');
    const detailUses = document.getElementById('detail-uses');
    const ptDetailsPanel = document.getElementById('pt-details');

    async function loadElements() {
        if (!ptGrid) return;
        
        try {
            // Show a simple loading fallback message
            ptGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: #64748b;">Loading dynamic elements...</p>';
            
            // Connect to elements backend API
            const response = await fetch('/api/elements');
            if (!response.ok) throw new Error('Failed to fetch elements');
            
            const data = await response.json();
            const elementsData = data.elements || [];
            
            ptGrid.innerHTML = ''; // Clear loading message
            
            if (elementsData.length === 0) {
                ptGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: #ef4444;">No elements found in database.</p>';
                return;
            }

            elementsData.forEach(element => {
                // Determine property mappings in case MongoDB schema uses atomicNumber vs number
                const eNum = element.number || element.atomicNumber || '?';
                const eMass = element.mass || element.atomicMass || '?';

                const elBox = document.createElement('div');
                elBox.classList.add('element-box');
                
                // Mathematical Grid Placement Logic relative to a canonical 18-column periodic table
                const z = parseInt(eNum);
                let r = 1, c = 1;
                if (z === 1) { r = 1; c = 1; }
                else if (z === 2) { r = 1; c = 18; }
                else if (z >= 3 && z <= 4) { r = 2; c = z - 2; }
                else if (z >= 5 && z <= 10) { r = 2; c = z + 8; }
                else if (z >= 11 && z <= 12) { r = 3; c = z - 10; }
                else if (z >= 13 && z <= 18) { r = 3; c = z; }
                else if (z >= 19 && z <= 36) { r = 4; c = z - 18; }
                
                elBox.style.gridRow = r;
                elBox.style.gridColumn = c;

                // Color mappings mapping roughly to the stylistic groups from the provided photo
                if ([1,3,11,19].includes(z)) elBox.style.backgroundColor = '#fca5a5'; // Alkali (Orange/Red)
                else if ([4,12,20].includes(z)) elBox.style.backgroundColor = '#fdba74'; // Alkaline Earth (Orange)
                else if (z >= 21 && z <= 30) elBox.style.backgroundColor = '#fbcfe8'; // Transition Metals (Pink)
                else if ([5,6,7,8,13,14,15,16,31,32,33,34].includes(z)) elBox.style.backgroundColor = '#bbf7d0'; // Non-metals / basic metals (Light green)
                else if ([9,17,35].includes(z)) elBox.style.backgroundColor = '#a7f3d0'; // Halogens (Medium Green)
                else if ([2,10,18,36].includes(z)) elBox.style.backgroundColor = '#6ee7b7'; // Noble Gases (Darker Green)

                elBox.innerHTML = `
                    <div class="element-number">${eNum}</div>
                    <div class="element-symbol" style="${[9,17,35].includes(z) ? 'color: #dc2626;' : ''}">${element.symbol}</div>
                `;
                
                elBox.addEventListener('click', () => {
                    document.querySelectorAll('.element-box').forEach(box => box.classList.remove('selected'));
                    elBox.classList.add('selected');

                    detailName.textContent = element.name || 'Unknown';
                    detailSymbol.textContent = element.symbol || '-';
                    detailNumber.textContent = eNum;
                    detailMass.textContent = eMass;
                    detailUses.textContent = element.uses || 'Not specified';

                    // Animate info panel sliding securely
                    ptDetailsPanel.classList.remove('visible');
                    void ptDetailsPanel.offsetWidth;
                    ptDetailsPanel.classList.add('visible');
                });

                ptGrid.appendChild(elBox);
            });
        } catch (error) {
            console.error(error);
            ptGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: #ef4444;">Error connecting to API. Please check your backend connection.</p>';
        }
    }

    // Initialize fetching periodic table on load
    loadElements();

    // ---- REACTION PREDICTOR LOGIC ----
    const rpInput = document.getElementById('rp-input');
    const rpBtn = document.getElementById('rp-btn');
    const rpOutput = document.getElementById('rp-output');

    if (rpBtn && rpInput && rpOutput) {
        rpBtn.addEventListener('click', async () => {
            const inputVal = rpInput.value.trim();
            if (!inputVal) return;

            // UI Loading State configuration
            const originalBtnText = rpBtn.textContent;
            rpBtn.textContent = 'Predicting...';
            rpBtn.disabled = true;
            rpBtn.style.opacity = '0.7';
            
            // Start fading out the old output box
            rpOutput.classList.remove('visible');

            try {
                // Post request to backend API
                const response = await fetch('/api/reactions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ input: inputVal })
                });

                const data = await response.json();
                
                // Add a micro-delay for UX fluidity
                setTimeout(() => {
                    if (response.ok && data.product) {
                        rpOutput.classList.remove('error');
                        rpOutput.innerHTML = `
                            <h3>Reaction Found!</h3>
                            <p><strong>Type:</strong> ${data.type}</p>
                            <p><strong>Predicted Products:</strong> ${data.product}</p>
                            <p><strong>Balanced Equation:</strong> <br> <span class="equation">${data.balanced}</span></p>
                        `;
                    } else {
                        rpOutput.classList.add('error');
                        rpOutput.innerHTML = `
                            <h3>${data.message || 'Reaction not found'}</h3>
                            <p>Could not predict the reaction for the given inputs. Try examples like <em>HCl + NaOH</em> or <em>Fe + O2</em>.</p>
                        `;
                    }
                    
                    void rpOutput.offsetWidth; // Force Reflow
                    rpOutput.classList.add('visible');
                }, 200);

            } catch (error) {
                console.error(error);
                setTimeout(() => {
                    rpOutput.classList.add('error');
                    rpOutput.innerHTML = `
                        <h3>Connection Error</h3>
                        <p>Failed to reach the database API. Please try again later.</p>
                    `;
                    void rpOutput.offsetWidth;
                    rpOutput.classList.add('visible');
                }, 200);
            } finally {
                // Retract loading behaviors
                rpBtn.textContent = originalBtnText;
                rpBtn.disabled = false;
                rpBtn.style.opacity = '1';
            }
        });

        // "Enter" key submission hook
        rpInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                rpBtn.click();
            }
        });
    }
});
